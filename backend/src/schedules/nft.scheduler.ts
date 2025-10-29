import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Cron } from '@nestjs/schedule'
import { setTimeout } from 'timers/promises'
import { NftEventType, PollNftAddressSyncEvent } from '../domain/nfts/listeners/interfaces'
import { NftSyncsEntityService } from '../shared/entity-services/nft-syncs/nft-syncs.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'

@Injectable()
export class NftScheduler {
  constructor(
    private logger: LoggerService,
    private eventEmitter: EventEmitter2,
    private nftSyncsEntityService: NftSyncsEntityService
  ) {}

  // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('*/6 * * * *', { utcOffset: 0 })
  async retryNftSync() {
    this.logger.info('Initiate job to retry nft sync', dateHelper.getUTCTimestamp())

    const nftAddressSyncs = await this.nftSyncsEntityService.getNftAddressSyncExecutedOrFailedMinutesAgoInThePastDay(5)
    this.logger.info('Amounts of running nft syncs: ', nftAddressSyncs.length)

    for (const nftAddressSync of nftAddressSyncs) {
      const pollNftAddressSyncEvent: PollNftAddressSyncEvent = { nftAddressSyncId: nftAddressSync.id }
      this.eventEmitter.emit(NftEventType.POLL_ADDRESS_SYNC, pollNftAddressSyncEvent)

      await setTimeout(10000)
    }
  }

  // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('0 */10 * * *', { utcOffset: 0 })
  async nftSyncStuck() {
    const nftAddressSyncs = await this.nftSyncsEntityService.getNftAddressSyncCreatedHoursAgo(12)
    for (const nftAddressSync of nftAddressSyncs) {
      this.logger.error('NFT Address Sync stuck in running status', nftAddressSync, {
        organizationId: nftAddressSync.organizationId,
        walletId: nftAddressSync.walletId
      })
    }
  }
}
