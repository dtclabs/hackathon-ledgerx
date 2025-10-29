import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, ILike, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'
import { Direction, PaginationParams, PaginationResponse } from '../../../core/interfaces'
import { WalletQueryParams } from '../../../wallets/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { LoggerService } from '../../logger/logger.service'
import { BaseEntityService } from '../base.entity-service'
import {
  SourceType,
  WalletBalancePerBlockchain,
  WalletOwnedCryptocurrenciesMap,
  WalletStatusesEnum
} from './interfaces'
import { WalletSync } from './wallet-sync.entity'
import { Wallet } from './wallet.entity'
import { BlockchainsEntityService } from '../blockchains/blockchains.entity-service'
import { GnosisWalletInfo } from '../../../domain/block-explorers/gnosis/interfaces'
import { InvalidStateError } from '../../errors/invalid-state.error'

@Injectable()
export class WalletsEntityService extends BaseEntityService<Wallet> {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletSync)
    private walletSyncRepository: Repository<WalletSync>,
    private blockchainsEntityService: BlockchainsEntityService,
    private logger: LoggerService
  ) {
    super(walletRepository)
  }

  getByOrganizationAndPublicId(organizationId: string, publicId: string, relations: FindOptionsRelations<Wallet> = {}) {
    return this.walletRepository.findOne({
      where: {
        publicId,
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }

  getByOrganizationAndPublicIds(
    organizationId: string,
    publicIds: string[],
    relations: FindOptionsRelations<Wallet> = {}
  ) {
    return this.walletRepository.find({
      where: {
        publicId: In(publicIds),
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }

  getByOrganizationIdAndAddress(
    organizationId: string, 
    address: string, 
    relations: FindOptionsRelations<Wallet> = {},
    options: { preserveCase?: boolean } = {}
  ) {
    // For Solana addresses, preserve case sensitivity
    const searchAddress = options.preserveCase ? address : address.toLowerCase()
    
    return this.walletRepository.findOne({
      where: {
        address: searchAddress,
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }

  getAllByOrganizationId(organizationId: string, relations: FindOptionsRelations<Wallet> = {}) {
    return this.walletRepository.find({
      where: {
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }

  getAllByOrganizationIdAndWalletGroupId(
    organizationId: string,
    walletGroupId: string,
    relations: FindOptionsRelations<Wallet> = {}
  ) {
    return this.walletRepository.find({
      where: {
        organization: {
          id: organizationId
        },
        walletGroup: {
          id: walletGroupId
        }
      },
      relations
    })
  }

  async getAllByOrganizationIdGroupedByAddress(
    organizationId: string,
    relations: FindOptionsRelations<Wallet> = {}
  ): Promise<Map<string, Wallet>> {
    const wallets = await this.walletRepository.find({
      where: {
        organization: {
          id: organizationId
        }
      },
      relations
    })

    const map = new Map<string, Wallet>()
    wallets.map((wallet) => map.set(wallet.address, wallet))

    return map
  }

  getByWalletId(walletId: string, relations: FindOptionsRelations<Wallet> = {}): Promise<Wallet> {
    return this.walletRepository.findOne({
      where: {
        id: walletId
      },
      relations
    })
  }

  async updateBalance(id: string, balance: WalletBalancePerBlockchain) {
    return this.walletRepository.update(
      {
        id
      },
      {
        balance: {
          lastSyncedAt: new Date(),
          blockchains: balance
        }
      }
    )
  }

  updateOwnedCryptocurrencies(walletId: string, walletOwnedCryptocurrency: WalletOwnedCryptocurrenciesMap) {
    return this.walletRepository.update({ id: walletId }, { ownedCryptocurrencies: walletOwnedCryptocurrency })
  }

  async updateChainStatusByAddress(
    params: {
      address: string
      organizationId: string
      blockchainIds?: string[]
    },
    status: WalletStatusesEnum
  ) {
    // Check if any of the blockchains is Solana to preserve case sensitivity
    const hasSolanaBlockchain = params.blockchainIds?.some(id => id.includes('solana'))
    
    const wallet = await this.getByOrganizationIdAndAddress(
      params.organizationId, 
      params.address,
      {},
      { preserveCase: hasSolanaBlockchain }
    )
    
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    if (status === WalletStatusesEnum.SYNCED) {
      return this.updateWalletsSyncStatusToSynced({ wallets: [wallet], blockchainIds: params.blockchainIds })
    } else if (status === WalletStatusesEnum.SYNCING) {
      return this.updateWalletsSyncStatusToSyncing({ wallets: [wallet], blockchainIds: params.blockchainIds })
    }
  }

  async updateWalletsSyncStatusForOrganization(organizationId: string, status: WalletStatusesEnum) {
    const wallets = await this.getAllByOrganizationId(organizationId)

    if (status === WalletStatusesEnum.SYNCED) {
      return this.updateWalletsSyncStatusToSynced({ wallets })
    } else if (status === WalletStatusesEnum.SYNCING) {
      return this.updateWalletsSyncStatusToSyncing({ wallets })
    }
  }

  async updateWalletsSyncStatusToSyncing(params: { wallets: Wallet[]; blockchainIds?: string[] }) {
    const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
    const repositoryManager = this.walletRepository.manager
    const walletIds: string[] = params.wallets.map((wallet) => wallet.id)

    await repositoryManager
      .transaction(async (transactionManager) => {
        const wallets = await transactionManager.find(Wallet, { where: { id: In(walletIds) } })
        for (const wallet of wallets) {
          if (wallet.status !== WalletStatusesEnum.SYNCING) {
            await transactionManager.update(Wallet, wallet.id, { status: WalletStatusesEnum.SYNCING })
          }
        }

        for (const wallet of wallets) {
          const blockchainIds = params.blockchainIds || wallet.supportedBlockchains || []
          for (const blockchainId of blockchainIds) {
            const isBlockchainEnabled = enabledBlockchainIds.includes(blockchainId)
            if (!isBlockchainEnabled) {
              continue
            }

            const isSupported = wallet.supportedBlockchains.includes(blockchainId)
            if (!isSupported) {
              this.logger.error(`Wallet ${wallet.id} is not supported on blockchainId ${blockchainId}`, {
                walletId: wallet.id,
                blockchainId
              })
              continue
            }

            let walletSync = await transactionManager.findOne(WalletSync, {
              where: { wallet: { id: wallet.id }, blockchainId: blockchainId }
            })

            if (!walletSync) {
              walletSync = WalletSync.create({
                wallet: wallet,
                blockchainId: blockchainId,
                status: null
              })
            }

            if (walletSync.status !== WalletStatusesEnum.SYNCING) {
              walletSync.status = WalletStatusesEnum.SYNCING
            } else {
              throw new InvalidStateError(`Wallet ${wallet.id} on blockchainId ${blockchainId} is already syncing`)
            }

            await transactionManager.save(WalletSync, walletSync)
          }
        }
      })
      .catch((e) => {
        if (e instanceof InvalidStateError) {
          this.logger.info('updateWalletSyncToSyncing failed with message: ', e)
        } else {
          this.logger.error('updateWalletSyncToSyncing failed with message: ', e)
        }

        throw e
      })
  }

  async updateWalletsSyncStatusToSynced(params: { wallets: Wallet[]; blockchainIds?: string[] }) {
    const repositoryManager = this.walletRepository.manager
    await repositoryManager
      .transaction(async (transactionManager) => {
        for (const wallet of params.wallets) {
          const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledIdsFrom(
            wallet.supportedBlockchains
          )
          const blockchainIds = params.blockchainIds || wallet.supportedBlockchains
          for (const blockchainId of blockchainIds) {
            let walletSync = await transactionManager.findOne(WalletSync, {
              where: { wallet: { id: wallet.id }, blockchainId: blockchainId }
            })

            if (!walletSync) {
              const isSupported = wallet.supportedBlockchains.includes(blockchainId)
              if (!isSupported) {
                continue
              }
              walletSync = WalletSync.create({
                wallet: wallet,
                blockchainId: blockchainId,
                status: null
              })
            }

            if (walletSync.status !== WalletStatusesEnum.SYNCED) {
              walletSync.status = WalletStatusesEnum.SYNCED
              walletSync.lastSyncedAt = dateHelper.getUTCTimestamp()
              await transactionManager.save(WalletSync, walletSync)
            }
          }

          const allWalletSyncs = await transactionManager.find(WalletSync, {
            where: { wallet: { id: wallet.id } }
          })
          const areOtherChainsSynced = enabledBlockchainIds.every((blockchainId) => {
            const walletSync = allWalletSyncs.find((walletSync) => walletSync.blockchainId === blockchainId)
            return walletSync && walletSync.status === WalletStatusesEnum.SYNCED
          })

          if (areOtherChainsSynced) {
            await transactionManager.update(Wallet, wallet.id, {
              status: WalletStatusesEnum.SYNCED,
              lastSyncedAt: dateHelper.getUTCTimestamp()
            })
          }
        }
      })
      .catch((e) => {
        this.logger.error('updateWalletsSyncStatusToSynced failed with message: ', e)
        throw e
      })
  }

  deleteWalletSyncsEntries(walletId: string) {
    return this.walletSyncRepository.delete({ wallet: { id: walletId } })
  }

  getByOrganizationIdNameOrAddress(params: { organizationId: string; nameOrAddress?: string }) {
    let where: FindOptionsWhere<Wallet>[] | FindOptionsWhere<Wallet> = {
      organization: {
        id: params.organizationId
      }
    }
    if (params.nameOrAddress) {
      where = [
        {
          organization: {
            id: params.organizationId
          },
          name: ILike(`%${params.nameOrAddress}%`)
        },
        {
          organization: {
            id: params.organizationId
          },
          address: ILike(`%${params.nameOrAddress}%`)
        }
      ]
    }

    return this.walletRepository.find({
      where: where,
      relations: { organization: true }
    })
  }

  async getAllPaging(
    options: PaginationParams,
    searchFields: string[],
    conditionalFields: FindOptionsWhere<Wallet>[] | FindOptionsWhere<Wallet> = null,
    relations: string[] = [],
    withDeleted = false
  ): Promise<PaginationResponse<Wallet>> {
    return super.getAllPaging(options, searchFields, conditionalFields as any, relations, withDeleted)
  }

  async getAllPagingWallet(
    options: WalletQueryParams,
    organizationId: string,
    walletGroupIds?: string[],
    blockchainIds?: string[]
  ): Promise<PaginationResponse<Wallet>> {
    const size = options.size || 10
    const page = options.page || 0
    const search = (options.search || '').trim()
    const order = options.order || 'createdAt'
    const direction = options.direction || Direction.DESC

    let whereQuery = 'wallet.organization_id = :organizationId'

    if (options.search) {
      whereQuery += ' AND (wallet.name ILIKE :search OR wallet.address ILIKE :search)'
    }

    if (options.statuses?.length) {
      whereQuery += ' AND wallet.status IN (:...statuses)'
    }

    if (walletGroupIds?.length) {
      whereQuery += ' AND walletGroup.id IN (:...walletGroupIds)'
    }

    if (options.assetIds?.length) {
      whereQuery += ` AND (`
      for (let index = 0; index < blockchainIds.length; index++) {
        whereQuery += `(EXISTS (SELECT * FROM json_array_elements(wallet.balance::json#>'{blockchains, ${
          blockchainIds[index]
        }}') as wb WHERE wb->'cryptocurrency'->>'publicId' IN (:...assetIds))) ${
          index < blockchainIds.length - 1 ? 'OR' : ''
        }`
      }
      whereQuery += `)`
    }

    if (options.blockchainIds?.length) {
      whereQuery += ` AND (supported_blockchains::jsonb ?| array[:...blockchainIds])`
    }

    const params = {
      organizationId: organizationId,
      search: `%${search}%`,
      statuses: options.statuses,
      walletGroupIds: walletGroupIds,
      assetIds: options.assetIds,
      blockchainIds: options.blockchainIds
    }

    const [items, total] = await this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.organization', 'organizationId')
      .leftJoinAndSelect('wallet.walletGroup', 'walletGroup')
      .where(whereQuery, params)
      .orderBy(`wallet.${order}`, direction)
      .skip(size * page)
      .take(size)
      .getManyAndCount()

    return {
      totalItems: total,
      totalPages: Math.ceil(total / size),
      currentPage: page,
      items,
      limit: size
    }
  }

  async getAllGnosisByOrganizationId(organizationId: string) {
    return this.walletRepository.find({
      where: {
        organization: {
          id: organizationId
        },
        sourceType: SourceType.GNOSIS
      }
    })
  }

  async getAllGnosisByPublicIds(publicIds: string[], organizationId: string) {
    return this.walletRepository.find({
      where: {
        publicId: In(publicIds),
        organization: {
          id: organizationId
        },
        sourceType: SourceType.GNOSIS
      }
    })
  }

  getAllSyncingForHoursWallets(hours: number): Promise<Wallet[]> {
    const queryTimestamp = dateHelper.getUTCTimestampHoursAgo(hours)

    const whereOptions: FindOptionsWhere<Wallet>[] = [
      { status: WalletStatusesEnum.SYNCING, updatedAt: LessThanOrEqual(queryTimestamp) },
      {
        walletSyncs: {
          status: WalletStatusesEnum.SYNCING,
          updatedAt: LessThanOrEqual(queryTimestamp)
        }
      }
    ]
    return this.walletRepository.find({
      where: whereOptions,
      relations: { walletSyncs: true, organization: true, walletGroup: true }
    })
  }

  getSyncedWalletsWithinTheLastHours(hours: number): Promise<Wallet[]> {
    const queryTimestamp = dateHelper.getUTCTimestampHoursAgo(hours)

    const whereOptions: FindOptionsWhere<Wallet> = {
      status: WalletStatusesEnum.SYNCED,
      lastSyncedAt: MoreThanOrEqual(queryTimestamp)
    }

    return this.walletRepository.find({
      where: whereOptions,
      relations: { organization: true }
    })
  }

  async getByIds(ids: string[]) {
    return this.walletRepository.find({
      where: {
        id: In(ids)
      }
    })
  }

  async updateMetadata(id: string, metadata: GnosisWalletInfo[]) {
    return this.walletRepository.update(id, { metadata })
  }
}
