import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { LoggerService } from '../../../shared/logger/logger.service'
import { PaymentEventType, PaymentExecutedEvent, PaymentsEventType, PaymentsSyncEvent } from '../events/events'
import { PaymentsDomainService } from '../../../payments/payments.domain.service'
import { WalletsEntityService } from '../../../shared/entity-services/wallets/wallets.entity-service'

@Injectable()
export class PaymentsListener {
  constructor(
    private readonly paymentsDomainService: PaymentsDomainService,
    private readonly walletsEntityService: WalletsEntityService,
    private readonly eventEmitter: EventEmitter2,
    private loggerService: LoggerService
  ) {}

  @OnEvent(PaymentsEventType.PAYMENTS_SYNC, {
    async: true,
    promisify: true
  })
  async syncPayments(paymentsSyncEvent: PaymentsSyncEvent) {
    this.loggerService.info(
      `Syncing payments for wallet group ${paymentsSyncEvent.walletGroupId} on ${paymentsSyncEvent.blockchainId}`,
      {
        organizationId: paymentsSyncEvent.organizationId,
        walletGroupId: paymentsSyncEvent.walletGroupId
      }
    )
    const wallets = await this.walletsEntityService.getAllByOrganizationIdAndWalletGroupId(
      paymentsSyncEvent.organizationId,
      paymentsSyncEvent.walletGroupId
    )

    for (const wallet of wallets) {
      try {
        await this.paymentsDomainService.syncPayments(wallet.id, paymentsSyncEvent.blockchainId)
      } catch (e) {
        this.loggerService.error(`Error while syncing payments for ${wallet.id}`, e, {
          organizationId: paymentsSyncEvent.organizationId,
          walletGroupId: paymentsSyncEvent.walletGroupId,
          blockchainId: paymentsSyncEvent.blockchainId
        })
      }
    }
  }

  @OnEvent(PaymentEventType.PAYMENT_EXECUTED, {
    async: true,
    promisify: true
  })
  async processExecutedPayment(paymentExecutedEvent: PaymentExecutedEvent) {
    this.loggerService.info(`Processing executed payment ${paymentExecutedEvent.paymentId}`, {
      paymentId: paymentExecutedEvent.paymentId
    })

    await this.paymentsDomainService.confirmTripleATransfer(paymentExecutedEvent.paymentId)
  }
}
