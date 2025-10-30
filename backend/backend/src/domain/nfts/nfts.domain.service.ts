import { BadRequestException, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import Decimal from 'decimal.js'
import { formatUnits } from 'ethers/lib/utils'
import { DeepPartial } from 'typeorm'
import { PricesService } from '../../prices/prices.service'
import { SupportedBlockchains } from '../../shared/entity-services/blockchains/interfaces'
import { CryptocurrenciesEntityService } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import {
  NftCollectionContractAddress,
  NftCollectionContractStandard,
  NftCollectionFloorPrice,
  NftCollectionFloorPriceAggregate
} from '../../shared/entity-services/nft-collections/interfaces'
import { NftCollection } from '../../shared/entity-services/nft-collections/nft-collection.entity'
import { NftCollectionsEntityService } from '../../shared/entity-services/nft-collections/nft-collections.entity-service'
import { NftSyncStatus } from '../../shared/entity-services/nft-syncs/interfaces'
import { NftAddressSync } from '../../shared/entity-services/nft-syncs/nft-address-sync.entity'
import { NftOrganizationSync } from '../../shared/entity-services/nft-syncs/nft-organization-sync.entity'
import { NftSyncsEntityService } from '../../shared/entity-services/nft-syncs/nft-syncs.entity-service'
import {
  NftFloorPrice,
  NftGainLossMetadata,
  NftTrait,
  NftTransactionMetadata
} from '../../shared/entity-services/nfts/interfaces'
import { Nft } from '../../shared/entity-services/nfts/nft.entity'
import { NftsEntityService } from '../../shared/entity-services/nfts/nfts.entity-service'
import { OrganizationSettingsEntityService } from '../../shared/entity-services/organization-settings/organization-settings.entity-service'
import { Wallet } from '../../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../../shared/helpers/date.helper'
import { decimalHelper } from '../../shared/helpers/decimal.helper'
import { LoggerService } from '../../shared/logger/logger.service'
import { HqDataNftService } from '../integrations/hq-data/hq-data-nft.service'
import { HqDataJob, HqDataJobStatus, HqDataNft, HqDataNftStatus, HqDataPrice } from '../integrations/hq-data/interfaces'
import { NftEventType, PollNftAddressSyncEvent } from './listeners/interfaces'

@Injectable()
export class NftsDomainService {
  constructor(
    private readonly hqDataNftService: HqDataNftService,
    private nftSyncsEntityService: NftSyncsEntityService,
    private walletsEntityService: WalletsEntityService,
    private nftEntityService: NftsEntityService,
    private nftCollectionsEntityService: NftCollectionsEntityService,
    private organizationSettingsEntityService: OrganizationSettingsEntityService,
    private cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private pricesService: PricesService,
    private logger: LoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async syncOrganization(organizationId: string): Promise<NftOrganizationSync> {
    let runningOrganizationSyncWorkflow = await this.nftSyncsEntityService.getOrganizationSyncByOrganizationIdAndStatus(
      organizationId,
      NftSyncStatus.RUNNING
    )

    // if (runningOrganizationSyncWorkflow) {
    //   // TODO: Enable below during development stage for easier retry, to delete later
    //   for (const nftAddressSync of runningOrganizationSyncWorkflow.nftAddressSyncs ?? []) {
    //     const event: PollNftAddressSyncEvent = {
    //       nftAddressSyncId: nftAddressSync.id
    //     }

    //     this.eventEmitter.emit(NftEventType.POLL_ADDRESS_SYNC, event)
    //   }

    //   return runningOrganizationSyncWorkflow
    // }

    const wallets = await this.walletsEntityService.getAllByOrganizationId(organizationId)
    const whitelistedWallets: Wallet[] = []
    // Only allow ethereum for now
    for (const wallet of wallets) {
      if (wallet.supportedBlockchains.includes(SupportedBlockchains.ETHEREUM_MAINNET)) {
        wallet.supportedBlockchains = [SupportedBlockchains.ETHEREUM_MAINNET]

        whitelistedWallets.push(wallet)
      }
    }

    if (!whitelistedWallets.length) {
      throw new BadRequestException('Please create a wallet with ethereum network first')
    }

    const nftOrganizationSync = await this.nftSyncsEntityService.createNftOrganizationSync({
      organizationId,
      wallets: whitelistedWallets
    })

    for (const nftAddressSync of nftOrganizationSync.nftAddressSyncs ?? []) {
      const event: PollNftAddressSyncEvent = {
        nftAddressSyncId: nftAddressSync.id
      }

      this.eventEmitter.emit(NftEventType.POLL_ADDRESS_SYNC, event)
    }

    return nftOrganizationSync
  }

  async getLatestSyncJobByOrganization(organizationId: string): Promise<NftOrganizationSync> {
    const nftOrganizationSync = await this.nftSyncsEntityService.getLatestNftOrganizationSyncByOrganizationId(
      organizationId
    )

    if (nftOrganizationSync?.status !== NftSyncStatus.COMPLETED) {
      await this.nftSyncsEntityService.refreshNftOrganizationSyncStatus(nftOrganizationSync.id)
      return this.nftSyncsEntityService.getLatestNftOrganizationSyncByOrganizationId(organizationId)
    }

    return nftOrganizationSync
  }

  async createHqDataAddressSyncJob(nftAddressSync: NftAddressSync) {
    const hqDataJobResponse: HqDataJob = await this.hqDataNftService.startAddressSync(nftAddressSync.address)

    const updateData: DeepPartial<NftAddressSync> = {
      syncId: hqDataJobResponse.id,
      status: NftSyncStatus.RUNNING
    }
    await this.nftSyncsEntityService.updateNftAddressSyncById(nftAddressSync.id, updateData)
  }

  async fetchAddressSyncJob(nftAddressSync: NftAddressSync) {
    const hqDataJobResponse: HqDataJob = await this.hqDataNftService.getAddressSyncById(nftAddressSync.syncId)

    switch (hqDataJobResponse.status) {
      case HqDataJobStatus.RUNNING:
        break
      case HqDataJobStatus.COMPLETED:
        try {
          await this.getAndStoreNftByAddressAndOrganizationId({
            address: nftAddressSync.address,
            blockchainId: nftAddressSync.blockchainId,
            organizationId: nftAddressSync.organizationId,
            walletId: nftAddressSync.walletId,
            updateAfter: nftAddressSync.metadata?.updateAfter
          })
        } catch (e) {
          const message = `Nfts domain service fetchAddressSyncJob error - ${e}`
          await this.nftSyncsEntityService.updateNftAddressSyncError(nftAddressSync.id, e.stack ?? e.message ?? e)
          this.logger.error(message, nftAddressSync, e)
          throw new Error(e)
        }
        await this.refreshCollectionPrice(nftAddressSync.organizationId)
        await this.refreshGainLossCalculation(nftAddressSync.organizationId)
        await this.nftSyncsEntityService.changeNftAddressSyncStatus(nftAddressSync.id, NftSyncStatus.COMPLETED)
        break
      case HqDataJobStatus.FAILED:
        this.logger.error(`Nft fetchAddressSyncJob ${nftAddressSync.id} failed`, nftAddressSync, hqDataJobResponse)
        await this.nftSyncsEntityService.changeNftAddressSyncStatus(
          nftAddressSync.id,
          NftSyncStatus.FAILED,
          `hqDataJobResponse.status = ${hqDataJobResponse.status}`
        )
        break
      default:
        this.logger.error(
          `Nft fetchAddressSyncJob ${nftAddressSync.id} has unknown response`,
          nftAddressSync,
          hqDataJobResponse
        )
        await this.nftSyncsEntityService.changeNftAddressSyncStatus(
          nftAddressSync.id,
          NftSyncStatus.FAILED,
          `hqDataJobResponse.status = ${hqDataJobResponse?.status}`
        )
    }
  }

  async getAndStoreNftByAddressAndOrganizationId(params: {
    address: string
    blockchainId: string
    organizationId: string
    walletId: string
    updateAfter?: Date
  }) {
    let pageNumber = 1
    const itemsPerPage = 50

    let hqDataNftResponseList: HqDataNft[] = []
    do {
      hqDataNftResponseList = await this.hqDataNftService.getNftsByAddress({
        address: params.address,
        pageNumber,
        itemsPerPage,
        updateAfter: params.updateAfter
      })

      if (!hqDataNftResponseList) {
        break
      }

      for (const hqDataNftResponse of hqDataNftResponseList) {
        await this.processNftResponse(hqDataNftResponse, params.organizationId, params.walletId)
      }

      pageNumber += 1
    } while (hqDataNftResponseList?.length === itemsPerPage)
  }

  async processNftResponse(hqDataNftResponse: HqDataNft, organizationId: string, walletId: string) {
    switch (hqDataNftResponse.status) {
      case HqDataNftStatus.OWNED:
        await this.processOwnedNft(hqDataNftResponse, organizationId, walletId)
        break
      case HqDataNftStatus.NOT_OWNED:
        await this.nftEntityService.softDeleteNft({
          sourceId: hqDataNftResponse.id,
          organizationId
        })
        break
      default:
        this.logger.error(`hqDataNftResponse ${hqDataNftResponse.id} has unknown status`, hqDataNftResponse, {
          organizationId,
          walletId
        })
    }
  }

  // Always upsert for now as the data is unstable. Once its stabilised, we should not need to upsert everytime
  async processOwnedNft(hqDataNftResponse: HqDataNft, organizationId: string, walletId: string) {
    let nftCollection: NftCollection = await this.nftCollectionsEntityService.getBySourceId(
      hqDataNftResponse.collection_id
    )

    if (!nftCollection) {
      const hqDataNftCollections = await this.hqDataNftService.getNftCollectionsBySourceId(
        hqDataNftResponse.collection_id
      )

      if (hqDataNftCollections?.length) {
        const hqDataNftCollection = hqDataNftCollections[0]

        let contractAddresses: NftCollectionContractAddress[] = []

        for (const contract of hqDataNftCollection.top_contracts ?? []) {
          const blockchainId = contract.split('.')?.at(0)
          const contractAddress = contract.split('.')?.at(1)
          if (blockchainId && contractAddress) {
            contractAddresses.push({ blockchainId, contractAddress })
          }
        }

        nftCollection = await this.nftCollectionsEntityService.upsertNftCollection({
          name: hqDataNftCollection.name,
          sourceId: hqDataNftCollection.id,
          imageUrl: hqDataNftCollection.image_url,
          bannerImageUrl: hqDataNftCollection.banner_image_url,
          description: hqDataNftCollection.description,
          contractStandard: NftCollectionContractStandard[hqDataNftCollection.contract_standard],
          tokenCount: hqDataNftCollection.total_quantity,
          contractAddresses: contractAddresses.length ? contractAddresses : null
        })
      } else {
        const errorMessage = `NFT collection ${hqDataNftResponse.collection_id} does not exist`
        this.logger.error(errorMessage, organizationId)
        throw new Error(errorMessage)
      }
    }

    const traits: NftTrait[] = []
    for (const trait of hqDataNftResponse.traits ?? []) {
      if (trait.trait_type && trait.value && trait.percentage)
        traits.push({
          key: trait.trait_type,
          value: trait.value,
          percentage: new Decimal(trait.percentage).toString()
        })
    }

    if (hqDataNftResponse.acquisitions?.length) {
      // Sale data is from acquisitions now instead of last_sale
      for (const acquisition of hqDataNftResponse.acquisitions) {
        //These are the owned nfts
        const transactionMetadata: NftTransactionMetadata = await this.getNftTransactionMetadata({
          paymentTokenSymbol: acquisition.sale_details?.payment_token_symbol,
          paymentTokenId: acquisition.sale_details?.payment_token_id,
          unitPrice: acquisition.sale_details?.unit_price,
          acquiredAt: acquisition.acquired_at,
          decimals: acquisition.sale_details?.payment_token_decimals
        })

        if (nftCollection.contractStandard === NftCollectionContractStandard.ERC721) {
          await this.nftEntityService.upsertNft({
            name: hqDataNftResponse.name,
            tokenId: hqDataNftResponse.token_id,
            sourceId: hqDataNftResponse.id,
            blockchainId: SupportedBlockchains.ETHEREUM_MAINNET,
            imageUrl: hqDataNftResponse.image_url,
            acquiredAt: hqDataNftResponse.first_acquired_at,
            nftCollectionId: nftCollection?.id,
            walletId: walletId,
            organizationId: organizationId,
            traits: traits.length ? traits : null,
            rarityRank: hqDataNftResponse.rarity?.rank?.toString(),
            transactionMetadata
          })
        } else if (nftCollection.contractStandard === NftCollectionContractStandard.ERC1155) {
          for (let quantityId = 1; quantityId <= acquisition.quantity; quantityId++) {
            await this.nftEntityService.upsertNft({
              name: hqDataNftResponse.name,
              tokenId: hqDataNftResponse.token_id,
              sourceId: hqDataNftResponse.id,
              sourceAdditionalId: acquisition.acquisition_id,
              quantityId,
              blockchainId: SupportedBlockchains.ETHEREUM_MAINNET,
              imageUrl: hqDataNftResponse.image_url,
              acquiredAt: acquisition.acquired_at,
              nftCollectionId: nftCollection.id,
              walletId: walletId,
              organizationId: organizationId,
              traits: traits.length ? traits : null,
              rarityRank: hqDataNftResponse.rarity?.rank?.toString(),
              transactionMetadata
            })
          }

          await this.nftEntityService.deleteBySourceIdAndSourceAdditionalIdAndQuantityIdAndOrganizationId({
            sourceId: hqDataNftResponse.id,
            sourceAdditionalId: acquisition.acquisition_id,
            quantityId: acquisition.quantity + 1,
            organizationId
          })
        }
      }

      for (const deletedAcquisitionId of hqDataNftResponse.deleted_acquisition_ids ?? []) {
        await this.nftEntityService.deleteBySourceIdAndSourceAdditionalIdAndQuantityIdAndOrganizationId({
          sourceId: hqDataNftResponse.id,
          sourceAdditionalId: deletedAcquisitionId,
          quantityId: 1,
          organizationId
        })
      }
    }
  }

  async getNftTransactionMetadata(params: {
    paymentTokenSymbol: string
    paymentTokenId: string
    unitPrice: string
    acquiredAt: Date
    hash?: string
    decimals: string
  }): Promise<NftTransactionMetadata> {
    let transactionMetadata: NftTransactionMetadata

    // Due to the provider, there can be cases where the symbol and id are null
    if (params.paymentTokenSymbol && params.paymentTokenId && params.unitPrice && params.decimals) {
      const cryptocurrency: Cryptocurrency = await this.getCryptocurrencyFromSaleData(
        params.paymentTokenSymbol,
        params.paymentTokenId
      )

      if (cryptocurrency)
        transactionMetadata = {
          hash: params.hash,
          costBasisAmount: decimalHelper.formatWithDecimals(params.unitPrice, params.decimals).toString(),
          costBasisCryptocurrencyId: cryptocurrency.id,
          valueAt: params.acquiredAt
        }
    } else {
      const cryptocurrency: Cryptocurrency = await this.cryptocurrenciesEntityService.getCoinByBlockchain('ethereum')
      transactionMetadata = {
        costBasisAmount: '0',
        costBasisCryptocurrencyId: cryptocurrency.id,
        valueAt: params.acquiredAt
      }
    }

    return transactionMetadata
  }

  async refreshCollectionPrice(organizationId: string) {
    const collectionsTemp = await this.nftEntityService.getCollectionIdsByOrganizationId(organizationId)

    const collectionIds = collectionsTemp.map((c) => c.collectionId)

    const collections: NftCollection[] = await this.nftCollectionsEntityService.getByIdsAndFloorUpdatedBefore(
      collectionIds,
      dateHelper.getUTCTimestampMinutesAgo(5)
    )

    const currentTime = dateHelper.getUTCTimestamp()

    while (collections?.length) {
      const slicedCollections = collections.splice(0, 30) // batching
      const slicedCollectionIds = slicedCollections.map((c) => c.sourceId)

      const hqDataPrices = await this.hqDataNftService.getNftCollectionPricesByCollectionIds(slicedCollectionIds)

      const pricesGroupedByCollectionId: { [collectionId: string]: HqDataPrice[] } = {}

      for (const hqDataPrice of hqDataPrices) {
        if (!pricesGroupedByCollectionId[hqDataPrice.collection_id]) {
          pricesGroupedByCollectionId[hqDataPrice.collection_id] = []
        }

        pricesGroupedByCollectionId[hqDataPrice.collection_id].push(hqDataPrice)
      }

      for (const slicedCollection of slicedCollections) {
        const slicedHqDataPrices = pricesGroupedByCollectionId[slicedCollection.sourceId]

        if (slicedHqDataPrices?.length) {
          const floorPrices: NftCollectionFloorPrice[] = []
          const ethCryptocurrency = await this.cryptocurrenciesEntityService.getCoinByBlockchain(
            SupportedBlockchains.ETHEREUM_MAINNET
          )
          // Below is a pseudo cryptocurrency converter code where we need to exchange any cryptocurrency to ETH.
          // The fiat currency here does not really matter.
          const fixedFiatCurrencyForConversion = 'USD'
          const currentEthPrice = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
            ethCryptocurrency,
            fixedFiatCurrencyForConversion
          )
          const cryptocurrencyAmountArray = []

          for (const slicedHqDataPrice of slicedHqDataPrices) {
            const cryptocurrency: Cryptocurrency = await this.getCryptocurrencyFromSaleData(
              slicedHqDataPrice.payment_token_symbol,
              slicedHqDataPrice.payment_token_id
            )

            if (cryptocurrency) {
              const cryptocurrencyAmount = formatUnits(
                slicedHqDataPrice.value,
                slicedHqDataPrice.payment_token_decimals
              )
              const currentCryptocurrencyPrice = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
                cryptocurrency,
                fixedFiatCurrencyForConversion
              )

              if (currentCryptocurrencyPrice) {
                cryptocurrencyAmountArray.push(
                  new Decimal(cryptocurrencyAmount).mul(currentCryptocurrencyPrice).div(currentEthPrice)
                )
              }

              floorPrices.push({
                marketplaceName: slicedHqDataPrice.marketplace_name,
                marketplaceId: slicedHqDataPrice.marketplace_id,
                cryptocurrencyId: cryptocurrency.id,
                cryptocurrencyAmount: cryptocurrencyAmount
              })
            }
          }

          if (floorPrices.length) {
            const floorPriceAggregate: NftCollectionFloorPriceAggregate = {
              floorPrices
            }
            if (cryptocurrencyAmountArray?.length) {
              floorPriceAggregate.averageCryptocurrencyId = ethCryptocurrency.id
              const totalAmount = cryptocurrencyAmountArray.reduce((prev, curr) => prev.add(curr), new Decimal(0))
              floorPriceAggregate.averageCryptocurrencyAmount = totalAmount
                .div(cryptocurrencyAmountArray.length)
                .toString()
            }

            await this.nftCollectionsEntityService.updateFloorPricesById(
              slicedCollection.id,
              floorPriceAggregate,
              currentTime
            )
          } else {
            await this.nftCollectionsEntityService.updateFloorPricesById(slicedCollection.id, null, currentTime)
          }
        } else {
          await this.nftCollectionsEntityService.updateFloorPricesById(slicedCollection.id, null, currentTime)
        }
      }
    }
  }

  async refreshGainLossCalculation(organizationId: string) {
    const organizationSetting = await this.organizationSettingsEntityService.getByOrganizationId(organizationId, {
      fiatCurrency: true
    })
    const organizationCurrency = organizationSetting.fiatCurrency.alphabeticCode

    const batchSize = 100
    let skip = 0

    let nfts: Nft[] = []

    do {
      nfts = await this.nftEntityService.getAllByOrganizationIdBatched(organizationId, skip, batchSize)

      if (nfts.length) {
        for (const nft of nfts) {
          const transactionMetadata = nft.transactionMetadata

          if (transactionMetadata && transactionMetadata.costBasisCryptocurrencyId) {
            const costBasisCryptocurrency = await this.cryptocurrenciesEntityService.getById(
              transactionMetadata.costBasisCryptocurrencyId
            )
            const acquiredPrice: Decimal = await this.pricesService.getFiatPriceByCryptocurrency(
              costBasisCryptocurrency,
              organizationCurrency,
              nft.acquiredAt
            )

            const costBasisFiatAmount = new Decimal(transactionMetadata.costBasisAmount).mul(acquiredPrice)

            const gainLossMetadata: NftGainLossMetadata = {
              fiatCurrency: organizationCurrency,
              costBasisFiatAmount: costBasisFiatAmount.toString()
            }

            if (nft.nftCollection.floorPriceAggregate && nft.nftCollection.floorPriceAggregate.floorPrices?.length) {
              if (nft.nftCollection.floorPriceAggregate.averageCryptocurrencyAmount) {
                const ethCryptocurrency = await this.cryptocurrenciesEntityService.getCoinByBlockchain('ethereum')
                const ethCurrentPrice = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
                  ethCryptocurrency,
                  organizationCurrency
                )

                const currentValueFiatAmount = new Decimal(
                  nft.nftCollection.floorPriceAggregate.averageCryptocurrencyAmount
                ).mul(ethCurrentPrice)
                const gainLoss = currentValueFiatAmount.sub(costBasisFiatAmount)

                const floorPrices: NftFloorPrice[] = []
                for (const nftFloorPrice of nft.nftCollection.floorPriceAggregate.floorPrices) {
                  const cryptocurrency = await this.cryptocurrenciesEntityService.getById(
                    nftFloorPrice.cryptocurrencyId
                  )
                  const fiatPrice = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
                    cryptocurrency,
                    organizationCurrency
                  )
                  const fiatAmount = new Decimal(fiatPrice).mul(nftFloorPrice.cryptocurrencyAmount).toString()
                  floorPrices.push({ ...nftFloorPrice, fiatAmount })
                }

                gainLossMetadata.currentValueFiatAmount = currentValueFiatAmount.toString()
                gainLossMetadata.currentValueCryptocurrencyId =
                  nft.nftCollection.floorPriceAggregate.averageCryptocurrencyId
                gainLossMetadata.currentValueCryptocurrencyAmount =
                  nft.nftCollection.floorPriceAggregate.averageCryptocurrencyAmount
                gainLossMetadata.gainLoss = gainLoss.toString()
                gainLossMetadata.floorPrices = floorPrices
              }
            }

            await this.nftEntityService.updateGainLossMetadataById(nft.id, gainLossMetadata)
          }
        }
      }
      skip += nfts.length
    } while (nfts.length === batchSize)
  }

  // These are from SimpleHash
  async getCryptocurrencyFromSaleData(paymentTokenSymbol: string, paymentTokenId: string) {
    if (paymentTokenSymbol === 'ETH') {
      return this.cryptocurrenciesEntityService.getCoinByBlockchain('ethereum')
    } else {
      const parts = paymentTokenId.split('.')

      const address = parts?.at(1).toLowerCase()

      const cryptocurrency = await this.cryptocurrenciesEntityService.createNewErc20Token(address, 'ethereum')

      return cryptocurrency
    }
  }
}
