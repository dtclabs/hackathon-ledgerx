import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FindOptionsRelations } from 'typeorm'
import { TaskSyncType } from '../core/events/event-types'
import { PaginationResponse } from '../core/interfaces'
import { BlockExplorerAdapterFactory } from '../domain/block-explorers/block-explorer.adapter.factory'
import { GnosisProviderService } from '../domain/block-explorers/gnosis/gnosis-provider.service'
import { FinancialTransformationsDomainService } from '../domain/financial-transformations/financial-transformations.domain.service'
import { WalletsTransformationsDomainService } from '../domain/financial-transformations/wallets-transformations.domain.service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { ChartOfAccountMappingsEntityService } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { ContactsEntityService } from '../shared/entity-services/contacts/contacts.entity-service'
import {
  OrganizationAddressesService,
  ValidationResponse
} from '../shared/entity-services/contacts/organization-addresses.service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { FeatureFlagsEntityService } from '../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { GainsLossesEntityService } from '../shared/entity-services/gains-losses/gains-losses.entity-service'
import { NftsEntityService } from '../shared/entity-services/nfts/nfts.entity-service'
import { PaymentsEntityService } from '../shared/entity-services/payments/payments.entity-service'
import { PayoutsEntityService } from '../shared/entity-services/payouts/payouts.entity-service'
import { PendingTransactionsEntityService } from '../shared/entity-services/pending-transactions/pending-transactions.entity-service'
import { WalletGroup } from '../shared/entity-services/wallet-groups/wallet-group.entity'
import { WalletGroupsEntityService } from '../shared/entity-services/wallet-groups/wallet-groups.entity-service'
import { GnosisWalletMetadata, SourceType, WalletStatusesEnum } from '../shared/entity-services/wallets/interfaces'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { WhitelistedAddressesEntityService } from '../shared/entity-services/whitelisted-addresses/whitelisted-addresses.entity.service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { withTimeout } from '../shared/utils/utils'
import { WalletEventTypesEnum } from './events/event-types'
import { WalletCreatedEvent, WalletDeletedEvent, WalletUpdatedEvent } from './events/events'
import { CreateWalletDto, UpdateWalletDto, WalletDto, WalletQueryParams } from './interfaces'
import { GnosisWalletInfo } from '../domain/block-explorers/gnosis/interfaces'

@Injectable()
export class WalletsDomainService {
  allRelations = ['organization', 'walletGroup']
  allFindOptionsRelations: FindOptionsRelations<Wallet> = { organization: true, walletGroup: true }

  constructor(
    private readonly walletsService: WalletsEntityService,
    private readonly financialTransactionsEntityService: FinancialTransactionsEntityService,
    private readonly financialTransformationsDomainService: FinancialTransformationsDomainService,
    private readonly addressesService: OrganizationAddressesService,
    private readonly logger: LoggerService,
    private readonly gnosisProviderService: GnosisProviderService,
    private readonly walletGroupsService: WalletGroupsEntityService,
    private readonly blockchainsEntityService: BlockchainsEntityService,
    private readonly gainsLossesService: GainsLossesEntityService,
    private readonly featureFlagsService: FeatureFlagsEntityService,
    private readonly walletsTransformationsDomainService: WalletsTransformationsDomainService,
    private readonly pendingTransactionsService: PendingTransactionsEntityService,
    private readonly cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private readonly contactsService: ContactsEntityService,
    private readonly chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private readonly payoutsEntityService: PayoutsEntityService,
    private readonly paymentsEntityService: PaymentsEntityService,
    private readonly whitelistedAddressesEntityService: WhitelistedAddressesEntityService,
    private readonly nftsEntityService: NftsEntityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    private readonly configService: ConfigService
  ) {}

  async getAllPaging(organizationId: string, query: WalletQueryParams) {
    let walletGroupIds = null
    let walletGroup = null

    if (query.walletGroupIds?.length) {
      walletGroup = await this.walletGroupsService.getByOrganizationAndPublicIds(organizationId, query.walletGroupIds)

      if (walletGroup?.length) {
        walletGroupIds = walletGroup.map((walletGroup) => walletGroup.id)
      } else {
        throw new BadRequestException("walletGroupPublicIds do not match to any 'Wallet Group' in the organization")
      }
    }

    // SOL: Prioritize Solana blockchains over EVM chains
    const allBlockchainIds = await this.blockchainsEntityService.getEnabledIdsFromOrDefaultIfEmpty(query.blockchainIds)
    const solanaBlockchains = allBlockchainIds.filter(id => id.includes('solana'))
    const blockchainIds = solanaBlockchains.length > 0 ? solanaBlockchains : allBlockchainIds

    this.logger.info(`SOL wallet query - using blockchains: ${blockchainIds.join(', ')}`, {
      requestedBlockchains: query.blockchainIds,
      availableBlockchains: allBlockchainIds,
      selectedBlockchains: blockchainIds,
      solanaOnly: solanaBlockchains.length > 0
    })

    const wallets = await this.walletsService.getAllPagingWallet(
      {
        ...query,
        blockchainIds
      },
      organizationId,
      walletGroupIds,
      blockchainIds
    )

    const contacts = await this.getGroupedContacts(organizationId)

    let cryptocurrencies: Cryptocurrency[] = []
    if (query.includeCryptocurrencyMetadata) {
      const cryptocurrencyIds: string[] = wallets.items.reduce((acc, wallet) => {
        const walletOwnedCryptocurrenciesMap = wallet.ownedCryptocurrencies ?? {}
        const ownedCryptocurrencyIds: string[] = Object.keys(walletOwnedCryptocurrenciesMap).reduce(
          (acc, blockchainId) => {
            if (wallet.supportedBlockchains.includes(blockchainId)) {
              return [...acc, ...(walletOwnedCryptocurrenciesMap[blockchainId] ?? [])]
            } else {
              return acc
            }
          },
          []
        )
        return [...acc, ...ownedCryptocurrencyIds]
      }, [])

      cryptocurrencies = await this.cryptocurrenciesEntityService.getAllByIds(cryptocurrencyIds, { addresses: true })
    }

    const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
    const walletDtos = wallets.items.map((source) =>
      WalletDto.map({ wallet: source, cryptocurrencies, enabledBlockchainIds, contacts })
    )

    return PaginationResponse.from({
      currentPage: wallets.currentPage,
      totalItems: wallets.totalItems,
      limit: wallets.limit,
      items: walletDtos
    })
  }

  async getGroupedContacts(organizationId: string): Promise<{ [address: string]: ContactDto }> {
    const contacts: ContactDto[] = await this.contactsService.getByOrganizationIdAndNameOrAddress({
      organizationId
    })

    return this.contactsService.groupContactDtosByAddress(contacts)
  }

  async getByOrganizationAndPublicId(publicId: string, organizationId: string) {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(
      organizationId,
      publicId,
      this.allFindOptionsRelations
    )
    if (!wallet) {
      return null
    }

    const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
    const walletRes = WalletDto.map({ wallet, enabledBlockchainIds })

    if (walletRes.sourceType === SourceType.GNOSIS) {
      const contacts = await this.getGroupedContacts(organizationId)
      return WalletDto.map({ wallet, enabledBlockchainIds, contacts })
    } else {
      return WalletDto.map({ wallet, enabledBlockchainIds })
    }
  }

  async update(publicId: string, organizationId: string, updateWalletDto: UpdateWalletDto) {
    const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()

    const wallet = await this.walletsService.getByOrganizationAndPublicId(
      organizationId,
      publicId,
      this.allFindOptionsRelations
    )

    if (!wallet) {
      return null
    }

    if (updateWalletDto.supportedBlockchains) {
      if (!updateWalletDto.supportedBlockchains.every((blockchain) => enabledBlockchainIds.includes(blockchain))) {
        throw new BadRequestException(
          `Please input a valid blockchain id. One of ${updateWalletDto.supportedBlockchains} is not supported or enabled`
        )
      }

      if (wallet.sourceType === SourceType.GNOSIS) {
        const gnosisWalletInfos = await this.getGnossisSafeInfoForMultichain(
          wallet.address,
          updateWalletDto.supportedBlockchains
        )
        this.validateGnosisSafeInfo(gnosisWalletInfos, updateWalletDto.supportedBlockchains)
      }
    }

    try {
      let walletGroup: WalletGroup = null
      // Validation first
      try {
        if (updateWalletDto.walletGroupId) {
          walletGroup = await this.walletGroupsService.getByOrganizationAndPublicId(
            organizationId,
            updateWalletDto.walletGroupId
          )

          if (!walletGroup) {
            throw new BadRequestException(`Please input a valid wallet group id`)
          }
        }

        await this.changeStatus({
          address: wallet.address,
          organizationId,
          status: WalletStatusesEnum.SYNCING,
          blockchainIds: wallet.supportedBlockchains
        })
      } catch (e) {
        this.logger.error('Error in updating wallet', wallet, e)
        throw new BadRequestException('Wallet is not in the right state to be updated')
      }

      const updatedFields = await this.walletsService.partiallyUpdate(wallet.id, {
        name: updateWalletDto.name ?? undefined,
        flaggedAt: updateWalletDto.flagged ? new Date() : updateWalletDto.flagged === false ? null : undefined,
        walletGroup: walletGroup ? walletGroup : undefined,
        supportedBlockchains: updateWalletDto.supportedBlockchains ?? undefined
      })

      if (updateWalletDto.supportedBlockchains) {
        const turnedOffBlockchains = wallet.supportedBlockchains.filter(
          (blockchain) => !updateWalletDto.supportedBlockchains.includes(blockchain)
        )
        if (turnedOffBlockchains.length) {
          await this.deleteByWalletAndInactiveBlockchains(organizationId, wallet, turnedOffBlockchains)
        }
      }

      // This should be called together with the sync all but there is no way to pass the lock now
      await this.changeStatus({
        address: wallet.address,
        organizationId,
        status: WalletStatusesEnum.SYNCED,
        blockchainIds: wallet.supportedBlockchains
      })

      // TODO: we sync all for now to reflect the changes in transaction type correctly. e.g. Deposit (Group) -> Deposit (Internal)
      // This is very slow so we need to optimize this.
      if (walletGroup) {
        await this.syncAll(organizationId, TaskSyncType.FULL)
      }

      this.eventEmitter.emit(WalletEventTypesEnum.WALLET_UPDATED, new WalletUpdatedEvent(wallet.id, organizationId))

      return WalletDto.map({
        wallet: {
          ...wallet,
          ...updatedFields
        },
        enabledBlockchainIds
      })
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e
      } else {
        this.logger.error('Error in updating wallet', wallet, e)
      }
    }
  }

  async delete(publicId: string, organizationId: string) {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(
      organizationId,
      publicId,
      this.allFindOptionsRelations
    )

    try {
      if (wallet) {
        // Only set status to syncing if not already syncing
        if (wallet.status !== WalletStatusesEnum.SYNCING) {
          await this.changeStatus({
            address: wallet.address,
            organizationId,
            status: WalletStatusesEnum.SYNCING,
            blockchainIds: wallet.supportedBlockchains
          })
        } else {
          this.logger.info(`Wallet ${wallet.publicId} is already syncing - proceeding with deletion`, {
            walletId: wallet.id,
            currentStatus: wallet.status,
            organizationId
          })
        }

        const affectedWalletAddresses = await this.financialTransactionsEntityService.deleteByOrganizationIdAndAddress({
          organizationId,
          wallet
        })

        const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
        for (const blockchainId of enabledBlockchainIds) {
          await this.gainsLossesService.deleteTaxLotSaleByWalletIdAndBlockchainId([wallet.id], blockchainId)
          await this.gainsLossesService.deleteTaxLotByWalletIdAndBlockchainId([wallet.id], blockchainId)
        }
        await this.nftsEntityService.deleteNftsByWalletIdAndOrganizationId(wallet.id, organizationId)

        for (const affectedAddress of affectedWalletAddresses) {
          await this.financialTransformationsDomainService.sync({
            address: affectedAddress,
            organizationId,
            syncType: TaskSyncType.FULL,
            blockchainIds: wallet.supportedBlockchains
          })
        }
        await this.walletsService.softDelete(wallet.id)
        await this.walletsService.deleteWalletSyncsEntries(wallet.id)

        try {
          await this.payoutsEntityService.softDeleteBySourceWallet(wallet)
        } catch (e) {
          this.logger.error(`Failed to delete payouts for wallet ${wallet.id}`, e)
        }

        try {
          await this.paymentsEntityService.softDeleteBySourceWallet(wallet)
        } catch (e) {
          this.logger.error(`Failed to delete payments for wallet ${wallet.id}`, e)
        }

        try {
          await this.pendingTransactionsService.softDeleteByWallet(wallet)
        } catch (e) {
          this.logger.error(`Failed to delete pending transactions for wallet ${wallet.id}`, e)
        }

        try {
          await this.chartOfAccountMappingsEntityService.softDeleteByWalletAndOrganization(wallet.id, organizationId)
        } catch (e) {
          this.logger.error(`Failed to delete chart of account mapping for wallet ${wallet.id}`, e)
        }

        this.eventEmitter.emit(WalletEventTypesEnum.WALLET_DELETED, new WalletDeletedEvent(wallet.id, organizationId))

        return true
      }
    } catch (e) {
      this.logger.error('Error in deleting wallet', wallet, e)
      await this.changeStatus({
        address: wallet.address,
        organizationId,
        status: WalletStatusesEnum.SYNCED,
        blockchainIds: wallet.supportedBlockchains
      })
    }
    return false
  }

  async create(organizationId: string, data: CreateWalletDto): Promise<WalletDto> {
    const addressLocation = await this.doesAddressExist(organizationId, data)

    if (!!addressLocation) {
      throw new BadRequestException(`This address exists in '${addressLocation.message}'.`)
    }

    const doesNameExist = await this.doesNameExist(organizationId, data)
    if (doesNameExist) {
      throw new BadRequestException('This wallet name already exists')
    }

    let gnosisWalletInfos: GnosisWalletInfo[] = []

    if (data.sourceType === SourceType.GNOSIS) {
      gnosisWalletInfos = await this.getGnossisSafeInfoForMultichain(data.address, data.supportedBlockchains)
      this.validateGnosisSafeInfo(gnosisWalletInfos, data.supportedBlockchains)
    }

    const walletGroup = await this.walletGroupsService.getByOrganizationAndPublicId(organizationId, data.walletGroupId)

    if (!walletGroup) {
      throw new BadRequestException(`Wallet group not found for ${data.walletGroupId}`)
    }

    let supportedBlockchains: string[]
    if (data.supportedBlockchains && data.supportedBlockchains.length > 0) {
      supportedBlockchains = await this.blockchainsEntityService.getEnabledIdsFrom(data.supportedBlockchains)
    } else {
      throw new BadRequestException('Supported blockchains are required!')
    }

    // We allow to create wallet with any size by default.
    // If the wallet is too large, we will throw an HTTP error 422, but if validation took more than MAX_VALIDATION_TIME_MS,
    // we will allow to create the wallet
    let isWalletSupported = true

    // Validation should not take too long, for non-critical validations we set timeout 15 seconds max.
    const MAX_VALIDATION_TIME_MS = 15000
    try {
      isWalletSupported = await withTimeout(async () => {
        return this.isWalletSupported(data.address)
      }, MAX_VALIDATION_TIME_MS)
    } catch (e) {
      this.logger.warning(`Timeout error when checking wallet ${data.address} for organization ${organizationId}`, e)
    }

    if (!isWalletSupported) {
      throw new UnprocessableEntityException(
        'This wallet appears to be quite large. Please reach out to our team so that we can assist you in adding it'
      )
    }

    try {
      const wallet = Wallet.create({
        name: data.name,
        address: data.address,
        organizationId: organizationId,
        walletGroupId: walletGroup.id,
        sourceType: data.sourceType,
        metadata: gnosisWalletInfos,
        // Always populate this field so that FE is not stuck
        lastSyncedAt: dateHelper.getUTCTimestamp(),
        supportedBlockchains: supportedBlockchains
      })

      const otherWallets = await this.walletsService.getAllByOrganizationId(organizationId)

      const createdWallet = await this.walletsService.create(wallet)

      // DISABLED FOR SOL TESTING: Skip all EVM background sync jobs
      // await this.syncWallet(organizationId, createdWallet, TaskSyncType.FULL)
      // for (const otherWallet of otherWallets) {
      //   await this.syncWallet(organizationId, otherWallet, TaskSyncType.FULL)
      // }
      
      this.logger.info(`Skipped EVM background sync for wallet ${createdWallet.id} - optimized for SOL testing`, {
        walletId: createdWallet.id,
        organizationId,
        address: data.address
      })

      try {
        await this.chartOfAccountMappingsEntityService.createByWalletAndOrganization(createdWallet.id, organizationId)
      } catch (e) {
        this.logger.error(`Failed to create default chart of account mapping for wallet ${wallet.id}`, e)
      }

      //we should get the wallet again ato get the all relations
      const latestWallet = await this.walletsService.get(createdWallet.id, { relations: this.allRelations })
      const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()

      this.eventEmitter.emit(WalletEventTypesEnum.WALLET_CREATED, new WalletCreatedEvent(wallet.id, organizationId))

      return WalletDto.map({ wallet: latestWallet, enabledBlockchainIds })
    } catch (error) {
      this.logger.error(
        `Error creating wallet: ${error.message}`,
        { error },
        {
          organizationId,
          data
        }
      )
      throw new InternalServerErrorException()
    }
  }

  private async getGnossisSafeMetadataForMultichain(
    address: string,
    blockchainIds: string[],
    walletMetadata?: GnosisWalletMetadata[]
  ) {
    const safeMetadataPerChainPromise = blockchainIds.map(async (blockchainId) => {
      const walletMetadataForChain = walletMetadata?.find((metadata) => metadata.blockchainId === blockchainId)
      return await this.getGnossisSafeMetadata(address, blockchainId, walletMetadataForChain)
    })
    return await Promise.all(safeMetadataPerChainPromise)
  }

  private async getGnossisSafeInfoForMultichain(address: string, blockchainIds: string[]) {
    const safeInfoPerChainPromise = blockchainIds.map(async (blockchainId) => {
      return this.gnosisProviderService.getSafeGnosis({
        address: address,
        blockchainId: blockchainId
      })
    })
    return await Promise.all(safeInfoPerChainPromise)
  }

  private async getGnossisSafeMetadata(
    address: string,
    blockchainId: string,
    metadata?: GnosisWalletMetadata
  ): Promise<GnosisWalletMetadata> {
    try {
      const gnosisInfo = await this.gnosisProviderService.getSafeGnosis({
        address: address,
        blockchainId: blockchainId
      })
      if (metadata?.creationTransactionInput) {
        return { ...metadata, ...gnosisInfo }
      } else {
        const creationInfo = await this.gnosisProviderService.getCreationInfo({
          address: address,
          blockchainId: blockchainId
        })
        if (creationInfo) {
          try {
            const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(blockchainId)
            const creationTransaction = await etherscanAdapter.getTransactionByHash(creationInfo.transactionHash)
            if (creationTransaction) {
              return {
                ...metadata,
                ...gnosisInfo,
                creationTransactionInput: creationTransaction.input
              }
            }
          } catch (e) {
            this.logger.error(`Error getting creation transaction`, e, { address, blockchainId })
          }
        }

        if (!!metadata && !!gnosisInfo) {
          return { ...metadata, ...gnosisInfo }
        } else if (!!gnosisInfo) {
          return { ...gnosisInfo }
        } else {
          return null
        }
      }
    } catch (e) {
      this.logger.error(`Error getting gnosis safe metadata`, e, { address, blockchainId })
      return null
    }
  }

  async doesAddressExist(organizationId: string, data: CreateWalletDto): Promise<ValidationResponse> {
    const validationResponse = await this.addressesService.getAddressLocationForWallet(data.address, organizationId)
    if (validationResponse) {
      return validationResponse
    }
  }

  async doesNameExist(organizationId: string, data: CreateWalletDto) {
    const wallet = await this.walletsService.findOne({
      where: [
        {
          name: data.name.trim(),
          organization: {
            id: organizationId
          }
        }
      ]
    })
    return !!wallet
  }

  async syncWalletWithPublicIdIncrementally(organizationId: string, publicId: string) {
    // SOL: Disable incremental sync for EVM, only allow for Solana wallets
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, publicId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }
    
    const hasSolanaBlockchain = wallet.supportedBlockchains.some(chain => chain.includes('solana'))
    if (!hasSolanaBlockchain) {
      this.logger.info(`Skipping sync for non-Solana wallet ${wallet.id} - SOL optimization`, {
        walletId: wallet.id,
        supportedBlockchains: wallet.supportedBlockchains
      })
      return
    }
    
    await this.syncWallet(organizationId, wallet, TaskSyncType.INCREMENTAL)
  }

  async syncWallet(organizationId: string, wallet: Wallet, syncType: TaskSyncType) {
    // SOL: Only sync Solana wallets, skip EVM to improve performance
    const hasSolanaBlockchain = wallet.supportedBlockchains.some(chain => chain.includes('solana'))
    if (!hasSolanaBlockchain) {
      this.logger.info(`Skipping EVM wallet sync for wallet ${wallet.id} - Solana-optimized configuration`, {
        walletId: wallet.id,
        organizationId,
        supportedBlockchains: wallet.supportedBlockchains,
        syncType
      })
      return
    }

    try {
      // Only get enabled Solana blockchains
      const allEnabledBlockchains = await this.blockchainsEntityService.getEnabledIdsFrom(
        wallet.supportedBlockchains
      )
      const enabledSolanaBlockchains = allEnabledBlockchains.filter(chain => chain.includes('solana'))

      if (enabledSolanaBlockchains.length === 0) {
        this.logger.info(`No enabled Solana blockchains found for wallet ${wallet.id}`, {
          walletId: wallet.id,
          supportedBlockchains: wallet.supportedBlockchains,
          allEnabledBlockchains
        })
        return
      }

      // Skip Gnosis Safe metadata for SOL wallets (Gnosis is EVM-only)
      if (wallet.sourceType === SourceType.GNOSIS) {
        this.logger.info(`Skipping Gnosis metadata sync for Solana-optimized wallet ${wallet.id}`, {
          walletId: wallet.id,
          sourceType: wallet.sourceType
        })
      }

      this.logger.info(`Syncing SOL wallet ${wallet.id} with blockchains: ${enabledSolanaBlockchains.join(', ')}`, {
        walletId: wallet.id,
        organizationId,
        blockchains: enabledSolanaBlockchains,
        syncType
      })

      await this.financialTransformationsDomainService.sync({
        address: wallet.address,
        organizationId,
        syncType,
        blockchainIds: enabledSolanaBlockchains
      })
    } catch (e) {
      this.logger.error(`Error syncing SOL wallet ${wallet.address} for organization ${organizationId}`, { 
        error: e,
        walletId: wallet.id,
        syncType
      })
    }
  }

  async syncAll(organizationId: string, syncType: TaskSyncType) {
    // SOL: Only sync Solana wallets in batch operations
    const allWallets = await this.walletsService.getAllByOrganizationId(organizationId)
    const solanaWallets = allWallets.filter(wallet => 
      wallet.supportedBlockchains.some(chain => chain.includes('solana'))
    )

    this.logger.info(`Solana-optimized batch sync: processing ${solanaWallets.length} Solana wallets out of ${allWallets.length} total wallets`, {
      organizationId,
      totalWallets: allWallets.length,
      solanaWallets: solanaWallets.length,
      syncType
    })

    for (const wallet of solanaWallets) {
      await this.syncWallet(organizationId, wallet, syncType)
    }
  }

  async changeStatus(payload: { address: string; organizationId: string; status: WalletStatusesEnum; blockchainIds?: string[] }) {
    await this.walletsService.updateChainStatusByAddress(
      {
        organizationId: payload.organizationId,
        address: payload.address,
        blockchainIds: payload.blockchainIds
      },
      payload.status
    )
  }

  async syncPendingTransactionsByWalletId(organizationId: string, publicWalletId: string) {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, publicWalletId)

    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    // SOL: Skip pending transactions sync for EVM wallets (Gnosis-specific feature)
    if (wallet.sourceType === SourceType.GNOSIS) {
      this.logger.info(`Skipping Gnosis pending transactions sync for Solana-optimized environment - wallet ${wallet.id}`, {
        walletId: wallet.id,
        organizationId,
        sourceType: wallet.sourceType
      })
      return
    }

    // For non-Gnosis SOL wallets, pending transactions are handled differently
    this.logger.info(`SOL wallet ${wallet.id} does not require Gnosis-style pending transaction sync`, {
      walletId: wallet.id,
      organizationId,
      sourceType: wallet.sourceType
    })
  }

  async syncPendingTransactionsByOrganization(organizationId: string) {
    // SOL: Skip Gnosis pending transactions for entire organization
    const gnosisWallets = await this.walletsService.getAllGnosisByOrganizationId(organizationId)
    
    this.logger.info(`Solana-optimized: Skipping pending transactions sync for ${gnosisWallets.length} Gnosis wallets in organization`, {
      organizationId,
      gnosisWalletsCount: gnosisWallets.length,
      reason: 'Solana-optimized configuration - Gnosis is EVM-only feature'
    })

    // For SOL wallets, pending transactions are handled by the blockchain directly
    // No need for manual pending transaction management like Gnosis Safe
  }

  private async deleteByWalletAndInactiveBlockchains(
    organizationId: string,
    wallet: Wallet,
    turnedOffBlockchains: string[]
  ) {
    await this.financialTransactionsEntityService.deleteByWalletAndTurnedOffBlockchains({
      organizationId,
      wallet,
      turnedOffBlockchains
    })

    for (const blockchainId of turnedOffBlockchains) {
      await this.gainsLossesService.deleteTaxLotSaleByWalletIdAndBlockchainId([wallet.id], blockchainId)
      await this.gainsLossesService.deleteTaxLotByWalletIdAndBlockchainId([wallet.id], blockchainId)
    }
  }

  private async isWalletSupported(address: string): Promise<boolean> {
    const whitelistedAddress = await this.whitelistedAddressesEntityService.getByAddress(address)
    if (whitelistedAddress) {
      return true
    }

    // SOL: Prioritize Solana blockchain support checks
    const getAllSupportedBlockchains = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
    const solanaBlockchains = getAllSupportedBlockchains.filter(id => id.includes('solana'))
    
    // If we have Solana blockchains available, check those first
    const blockchainsToCheck = solanaBlockchains.length > 0 ? solanaBlockchains : getAllSupportedBlockchains
    
    this.logger.info(`Solana-optimized wallet support check for address ${address}`, {
      address,
      availableBlockchains: getAllSupportedBlockchains,
      checkingBlockchains: blockchainsToCheck,
      prioritizingSolana: solanaBlockchains.length > 0
    })

    const isWalletSizeSupportedPerBlockchainTasks = blockchainsToCheck.map((blockchainId) =>
      this.isWalletSizeSupportedForBlockchain({
        address,
        blockchainId
      })
    )
    const isWalletSizeSupportedPerBlockchain = await Promise.all(isWalletSizeSupportedPerBlockchainTasks)

    // If any blockchain is not supported, return false
    return !isWalletSizeSupportedPerBlockchain.includes(false)
  }

  private async isWalletSizeSupportedForBlockchain(params: { address: string; blockchainId: string }) {
    // SOL: For Solana, we don't need to check transaction count limits like EVM
    if (params.blockchainId.includes('solana')) {
      this.logger.info(`SOL wallet size check - automatically supported for Solana blockchain`, {
        address: params.address,
        blockchainId: params.blockchainId
      })
      return true
    }

    // For EVM chains, still check transaction limits (if needed for legacy support)
    try {
      const adapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(params.blockchainId)
      const [externalTransactions, internalTransactions] = await Promise.all([
        adapter.getTransactionExternalsByAddress({
          address: params.address,
          page: 0,
          fromBlock: 0,
          offset: 0
        }),
        adapter.getTransactionInternalsByAddress({
          address: params.address,
          page: 0,
          fromBlock: 0,
          offset: 0
        })
      ])

      // Default Supported wallet size is 10000 transfers. Can be configured via SUPPORTED_WALLET_SIZE
      const supportedAmount = this.configService.get('SUPPORTED_WALLET_SIZE') ?? 10000
      const isSupported = externalTransactions.length + internalTransactions.length <= supportedAmount
      
      this.logger.info(`EVM wallet size check for ${params.blockchainId}`, {
        address: params.address,
        blockchainId: params.blockchainId,
        externalTxs: externalTransactions.length,
        internalTxs: internalTransactions.length,
        total: externalTransactions.length + internalTransactions.length,
        limit: supportedAmount,
        isSupported
      })

      return isSupported
    } catch (e) {
      this.logger.error(`Error checking wallet size for EVM blockchain ${params.blockchainId}`, e, {
        address: params.address,
        blockchainId: params.blockchainId
      })
      return false
    }
  }

  private validateGnosisSafeInfo(gnosisWalletInfos: GnosisWalletInfo[], supportedBlockchains: string[]) {
    for (const blockchainId of supportedBlockchains) {
      const gnosisSafeInfo = gnosisWalletInfos.find((info) => info?.blockchainId === blockchainId)
      if (!gnosisSafeInfo) {
        throw new BadRequestException(`Metadata for blockchain ${blockchainId} is missing`)
      }
    }
  }
}
