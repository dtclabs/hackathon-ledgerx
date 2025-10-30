import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, DeepPartial, In, LessThanOrEqual, Repository } from 'typeorm'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { Wallet } from '../wallets/wallet.entity'
import { NftSyncStatus } from './interfaces'
import { NftAddressSync } from './nft-address-sync.entity'
import { NftOrganizationSync } from './nft-organization-sync.entity'

@Injectable()
export class NftSyncsEntityService extends BaseEntityService<NftOrganizationSync> {
  constructor(
    @InjectRepository(NftOrganizationSync)
    private nftOrganizationSyncsRepository: Repository<NftOrganizationSync>,

    @InjectRepository(NftAddressSync)
    private nftAddressSyncsRepository: Repository<NftAddressSync>
  ) {
    super(nftOrganizationSyncsRepository)
  }

  async createNftOrganizationSync(params: { organizationId: string; wallets: Wallet[] }): Promise<NftOrganizationSync> {
    const repositoryManager = this.nftOrganizationSyncsRepository.manager

    let nftOrganizationSync

    await repositoryManager.transaction(async (transactionManager) => {
      const nftOrganizationSyncTemplate: DeepPartial<NftOrganizationSync> = {
        status: NftSyncStatus.RUNNING,
        organizationId: params.organizationId
      }
      nftOrganizationSync = await transactionManager.save(NftOrganizationSync, nftOrganizationSyncTemplate)

      for (const wallet of params.wallets) {
        for (const blockchain of wallet.supportedBlockchains) {
          const lastCompletedNftAddressSync = await transactionManager.findOne(NftAddressSync, {
            where: { walletId: wallet.id, blockchainId: blockchain, status: NftSyncStatus.COMPLETED }
          })

          const nftAddressSyncTemplate: DeepPartial<NftAddressSync> = {
            address: wallet.address,
            blockchainId: blockchain,
            status: NftSyncStatus.CREATED,
            organizationId: params.organizationId,
            walletId: wallet.id,
            nftOrganizationSync: { id: nftOrganizationSync.id }
          }
          if (lastCompletedNftAddressSync?.createdAt) {
            nftAddressSyncTemplate.metadata = {
              updateAfter: lastCompletedNftAddressSync?.createdAt
            }
          }

          await transactionManager.save(NftAddressSync, nftAddressSyncTemplate)
        }
      }
    })

    return this.nftOrganizationSyncsRepository.findOne({
      where: { id: nftOrganizationSync.id },
      relations: { nftAddressSyncs: true }
    })
  }

  getLatestNftOrganizationSyncByOrganizationId(organizationId: string) {
    return this.nftOrganizationSyncsRepository.findOne({
      where: {
        organizationId
      },
      order: { id: 'DESC' }
    })
  }

  getNftSyncAddressById(nftAddressSyncId: string): Promise<NftAddressSync> {
    return this.nftAddressSyncsRepository.findOne({
      where: { id: nftAddressSyncId },
      relations: { nftOrganizationSync: true }
    })
  }

  updateNftAddressSyncById(nftAddressSyncId: string, updateData: DeepPartial<NftAddressSync>) {
    return this.nftAddressSyncsRepository.update(nftAddressSyncId, updateData)
  }

  async refreshNftOrganizationSyncStatus(nftOrganizationSyncId: string) {
    const nftOrganizationSync = await this.nftOrganizationSyncsRepository.findOne({
      where: { id: nftOrganizationSyncId },
      relations: { nftAddressSyncs: true }
    })

    if (
      nftOrganizationSync.status !== NftSyncStatus.COMPLETED &&
      nftOrganizationSync.nftAddressSyncs.every((nftAddressSync) => nftAddressSync.status === NftSyncStatus.COMPLETED)
    ) {
      await this.changeNftOrganizationSyncStatus(nftOrganizationSyncId, NftSyncStatus.COMPLETED)
    }
  }

  getOrganizationSyncByOrganizationIdAndStatus(
    organizationId: string,
    status: NftSyncStatus
  ): Promise<NftOrganizationSync> {
    return this.nftOrganizationSyncsRepository.findOne({
      where: {
        organizationId,
        status
      },
      relations: {
        nftAddressSyncs: true
      }
    })
  }

  updateLastExecutedAt(id: string) {
    return this.nftAddressSyncsRepository.update(id, {
      lastExecutedAt: dateHelper.getUTCTimestamp()
    })
  }

  changeNftOrganizationSyncStatus(nftOrganizationSyncId: string, status: NftSyncStatus, operationalRemark?: string) {
    const tempDate = dateHelper.getUTCTimestamp()
    let updateData: Partial<NftOrganizationSync> = {
      status,
      completedAt: status === NftSyncStatus.COMPLETED ? tempDate : undefined
    }

    if (!!operationalRemark) {
      updateData = { ...updateData, operationalRemark }
    }

    return this.nftOrganizationSyncsRepository.update(nftOrganizationSyncId, updateData)
  }

  changeNftAddressSyncStatus(nftAddressSyncId: string, status: NftSyncStatus, operationalRemark?: string) {
    const tempDate = dateHelper.getUTCTimestamp()
    let updateData: Partial<NftAddressSync> = {
      status,
      lastExecutedAt: tempDate,
      completedAt: status === NftSyncStatus.COMPLETED ? tempDate : undefined
    }

    if (!!operationalRemark) {
      updateData = { ...updateData, operationalRemark }
    }

    return this.nftAddressSyncsRepository.update(nftAddressSyncId, updateData)
  }

  updateNftAddressSyncError(nftAddressSyncId: string, e: any) {
    return this.nftAddressSyncsRepository.update(nftAddressSyncId, { error: e })
  }

  getNftAddressSyncExecutedOrFailedMinutesAgoInThePastDay(minutes: number) {
    const queryTimestamp = dateHelper.getUTCTimestampMinutesAgo(minutes)
    const pastDayTimestamp = dateHelper.getUTCTimestampHoursAgo(24)

    return this.nftAddressSyncsRepository.find({
      where: {
        status: In([NftSyncStatus.RUNNING, NftSyncStatus.FAILED]),
        lastExecutedAt: Between(pastDayTimestamp, queryTimestamp)
      }
    })
  }

  getNftAddressSyncCreatedHoursAgo(hours: number) {
    const queryTimestamp = dateHelper.getUTCTimestampHoursAgo(hours)

    return this.nftAddressSyncsRepository.find({
      where: { status: NftSyncStatus.RUNNING, createdAt: LessThanOrEqual(queryTimestamp) }
    })
  }
}
