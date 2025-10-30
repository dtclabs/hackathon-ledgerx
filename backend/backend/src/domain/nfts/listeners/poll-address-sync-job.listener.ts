import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { setTimeout } from 'timers/promises'
import { NftSyncStatus } from '../../../shared/entity-services/nft-syncs/interfaces'
import { NftAddressSync } from '../../../shared/entity-services/nft-syncs/nft-address-sync.entity'
import { NftSyncsEntityService } from '../../../shared/entity-services/nft-syncs/nft-syncs.entity-service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import { NftsDomainService } from '../nfts.domain.service'
import { NftEventType, PollNftAddressSyncEvent } from './interfaces'

@Injectable()
export class PollAddressSyncJobListener {
  constructor(
    private readonly nftSyncsEntityService: NftSyncsEntityService,
    private nftsDomainService: NftsDomainService,
    private eventEmitter: EventEmitter2,
    private logger: LoggerService
  ) {}

  @OnEvent(NftEventType.POLL_ADDRESS_SYNC, { async: true, promisify: true })
  async pollAddressSyncJob(pollAddressSyncJobEvent: PollNftAddressSyncEvent) {
    let nftAddressSync: NftAddressSync = await this.nftSyncsEntityService.getNftSyncAddressById(
      pollAddressSyncJobEvent.nftAddressSyncId
    )

    try {
      if (nftAddressSync.status !== NftSyncStatus.COMPLETED) {
        await this.nftSyncsEntityService.updateLastExecutedAt(nftAddressSync.id)

        if (nftAddressSync.status === NftSyncStatus.CREATED) {
          await this.nftsDomainService.createHqDataAddressSyncJob(nftAddressSync)
        } else if ([NftSyncStatus.RUNNING, NftSyncStatus.FAILED].includes(nftAddressSync.status)) {
          await this.nftsDomainService.fetchAddressSyncJob(nftAddressSync)
        }

        nftAddressSync = await this.nftSyncsEntityService.getNftSyncAddressById(
          pollAddressSyncJobEvent.nftAddressSyncId
        )

        // Failed syncs will be retried by nft scheduler
        if (nftAddressSync.status === NftSyncStatus.RUNNING) {
          await setTimeout(15000)

          const pollNftAddressSyncEvent: PollNftAddressSyncEvent = { nftAddressSyncId: nftAddressSync.id }
          this.eventEmitter.emit(NftEventType.POLL_ADDRESS_SYNC, pollNftAddressSyncEvent)
        } else if (nftAddressSync.status === NftSyncStatus.COMPLETED) {
          await this.nftSyncsEntityService.refreshNftOrganizationSyncStatus(nftAddressSync.nftOrganizationSync.id)

          const { minutes, seconds } = dateHelper.getMinutesAndSecondsDifferenceFromTime(nftAddressSync.createdAt)
          this.logger.info(
            `nftAddressSyncJob ${nftAddressSync.id} is COMPLETED for ${minutes} minutes and ${seconds} seconds`
          )
        }
      }
    } catch (e) {
      await this.nftSyncsEntityService.updateNftAddressSyncError(nftAddressSync.id, e.stack ?? e.message ?? e)
      this.logger.error(
        `pollAddressSyncJob ${pollAddressSyncJobEvent.nftAddressSyncId} has errors`,
        e.stack ?? e.message ?? e
      )
    }
  }
}
