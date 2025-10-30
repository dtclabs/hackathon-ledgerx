import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { PaginationResponse } from '../core/interfaces'
import { NftsDomainService } from '../domain/nfts/nfts.domain.service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { ContactsEntityService } from '../shared/entity-services/contacts/contacts.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { NftCollectionsEntityService } from '../shared/entity-services/nft-collections/nft-collections.entity-service'
import { NftsEntityService } from '../shared/entity-services/nfts/nfts.entity-service'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import { NftAggregateDto, NftDto, NftQueryParams } from './interfaces'

@Injectable()
export class NftsControllerService {
  constructor(
    private nftsDomainService: NftsDomainService,
    private nftsEntityService: NftsEntityService,
    private nftCollectionsEntityService: NftCollectionsEntityService,
    private readonly walletsEntityService: WalletsEntityService,
    private readonly blockchainsEntityService: BlockchainsEntityService,
    private readonly contactsEntityService: ContactsEntityService,
    private readonly organizationSettingsEntityService: OrganizationSettingsEntityService,
    private readonly cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private readonly logger: LoggerService
  ) {}

  async getAllNftPaging(organizationId: string, query: NftQueryParams) {
    const [collectionIds, walletIds, blockchainIds] = await this.validateNftFilters(organizationId, query)

    query.size = query.size || 10
    query.page = query.page || 0

    const [nfts, totalItems] = await this.nftsEntityService.getAllNftPaging(organizationId, {
      ...query,
      collectionIds,
      walletIds,
      blockchainIds
    })

    const contactDtoMap = await this.contactsEntityService.getGroupedContactDtosByAddressPerOrganization(organizationId)
    const floorPriceCryptocurrency = await this.cryptocurrenciesEntityService.getCoinByBlockchain('ethereum')

    const nftDtos: NftDto[] = []

    for (const nft of nfts) {
      const costBasisCryptocurrency = await this.cryptocurrenciesEntityService.getById(
        nft.transactionMetadata?.costBasisCryptocurrencyId
      )
      const currentValueCryptocurrency = await this.cryptocurrenciesEntityService.getById(
        nft.gainLossMetadata?.currentValueCryptocurrencyId
      )
      const contactDto = contactDtoMap[nft.wallet.address]

      nftDtos.push(
        NftDto.map({
          nft,
          costBasisCryptocurrency,
          contact: contactDto,
          currentValueCryptocurrency,
          floorPriceCryptocurrency
        })
      )
    }

    return PaginationResponse.from({
      totalItems,
      currentPage: query.page,
      items: nftDtos,
      limit: query.size
    })
  }

  async getNftAggregate(organizationId: string, query: NftQueryParams) {
    const [collectionIds, walletIds, blockchainIds] = await this.validateNftFilters(organizationId, query)

    const nfts = await this.nftsEntityService.getNftAggregateData(
      organizationId,
      {
        ...query,
        collectionIds,
        walletIds,
        blockchainIds
      },
      {
        id: true, // This is needed so when gainLoss is null then the row is still returned for total count
        gainLossMetadata: {
          costBasisFiatAmount: true,
          currentValueFiatAmount: true,
          gainLoss: true
        }
      }
    )

    const totalNfts = nfts.length
    let totalCostBasis = new Decimal(0)
    let totalCurrentValue = new Decimal(0)
    let totalGainLoss = new Decimal(0)

    for (const nft of nfts) {
      totalCostBasis = totalCostBasis.add(nft.gainLossMetadata?.costBasisFiatAmount ?? 0)
      totalCurrentValue = totalCurrentValue.add(nft.gainLossMetadata?.currentValueFiatAmount ?? 0)
      totalGainLoss = totalGainLoss.add(nft.gainLossMetadata?.gainLoss ?? 0)
    }

    const fiatCurrency = (
      await this.organizationSettingsEntityService.getByOrganizationId(organizationId, { fiatCurrency: true })
    ).fiatCurrency.alphabeticCode

    const result: NftAggregateDto = {
      totalNfts: totalNfts,
      totalCostBasis: totalCostBasis.toString(),
      totalCurrentValue: totalCurrentValue.toString(),
      totalGainLoss: totalGainLoss.toString(),
      fiatCurrency
    }

    return result
    // return { ...nftsData, totalItems: unwrapResponse.length, items: unwrapResponse }
  }

  async validateNftFilters(organizationId: string, query: NftQueryParams) {
    let collectionIds: string[] = []
    let walletIds: string[] = []
    let blockchainIds: string[] = []

    if (query.collectionIds) {
      const collections = await this.nftCollectionsEntityService.getByPublicIds(query.collectionIds, { id: true })

      collectionIds = collections.map((c) => c.id)

      if (collectionIds?.length !== query.collectionIds.length) {
        throw new BadRequestException('Invalid collections')
      }
    }

    if (query.walletIds) {
      const wallets = await this.walletsEntityService.getByOrganizationAndPublicIds(organizationId, query.walletIds)

      walletIds = wallets.map((w) => w.id)

      if (walletIds?.length !== query.walletIds.length) {
        throw new BadRequestException('Invalid wallets')
      }
    }

    if (query.blockchainIds) {
      for (const blockchainId of query.blockchainIds) {
        const blockchainExist = await this.blockchainsEntityService.getByPublicId(blockchainId)

        if (!blockchainExist) {
          throw new BadRequestException('Invalid blockchainId')
        }
      }

      blockchainIds = query.blockchainIds
    }

    return [collectionIds, walletIds, blockchainIds]
  }

  async getNftByPublicId(organizationId: string, publicId: string): Promise<NftDto> {
    const nft = await this.nftsEntityService.getByPublicIdAndOrganizationId(publicId, organizationId)

    if (nft) {
      const contactDtoMap = await this.contactsEntityService.getGroupedContactDtosByAddressPerOrganization(
        organizationId
      )
      const costBasisCryptocurrency = await this.cryptocurrenciesEntityService.getById(
        nft.transactionMetadata?.costBasisCryptocurrencyId
      )
      const floorPriceCryptocurrency = await this.cryptocurrenciesEntityService.getCoinByBlockchain('ethereum')
      const contactDto = contactDtoMap[nft.wallet.address]
      return NftDto.map({ nft, costBasisCryptocurrency, contact: contactDto, floorPriceCryptocurrency })
    } else {
      throw new NotFoundException('Invalid nft id')
    }
  }
}
