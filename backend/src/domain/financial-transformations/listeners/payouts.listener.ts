import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { LoggerService } from '../../../shared/logger/logger.service'
import { PayoutsEventType } from '../events/events'
import { PayoutsDomainService } from '../../../payouts/payouts.domain.service'

@Injectable()
export class PayoutsListener {
  constructor(private readonly payoutsDomainService: PayoutsDomainService, private loggerService: LoggerService) {}

  @OnEvent(PayoutsEventType.PAYOUTS_SYNC, {
    async: true,
    promisify: true
  })
  async syncPayouts(params: { walletId: string; blockchainId: string }) {
    this.loggerService.info(`Syncing payouts for ${params.walletId} on ${params.blockchainId}`, {
      walletId: params.walletId
    })

    try {
      await this.payoutsDomainService.syncPayouts(params.walletId, params.blockchainId)
    } catch (e) {
      this.loggerService.error(`Error while syncing payouts for ${params.walletId}`, e, {
        walletId: params.walletId,
        blockchainId: params.blockchainId
      })
    }
  }
}
