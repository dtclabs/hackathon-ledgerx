import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { PaymentsEntityService } from '../shared/entity-services/payments/payments.entity-service'
import { PaymentsDomainService } from '../payments/payments.domain.service'
import { PaymentProvider, ProviderStatus } from '../shared/entity-services/payments/interfaces'

@Injectable()
export class PaymentScheduler {
  constructor(
    private paymentsEntityService: PaymentsEntityService,
    private paymentsDomainService: PaymentsDomainService,
    private loggerService: LoggerService
  ) {}

  // Runs every 10 minutes
    // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('*/10 * * * *')
  async handleClearingPaymentWorkflows() {
    this.loggerService.info('Execute hourly job to retry unconfirmed Triple A payments', dateHelper.getUTCTimestamp())

    try {
      const payments = await this.paymentsEntityService.findUnconfirmedTripleAPayments({
        from: dateHelper.getUTCTimestampHoursAgo(3),
        to: dateHelper.getUTCTimestampMinutesAgo(10)
      })

      for (const payment of payments) {
        try {
          await this.paymentsDomainService.confirmTripleATransfer(payment.id)
        } catch (e) {
          this.loggerService.info(`Failed to confirm Triple A Transfer for payment ${payment.id}`, e, {
            organizationId: payment.organization?.id
          })
        }
      }
    } catch (e) {
      this.loggerService.error('Error while retrying unconfirmed Triple A payments', e, {
        timestamp: dateHelper.getUTCTimestamp()
      })
    }

    this.loggerService.info('Completed hourly job to retry unconfirmed Triple A payments', dateHelper.getUTCTimestamp())
  }

  // Runs every hour
    // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('20 */1 * * *')
  async handleMetamaskPaymentWorkflows() {
    this.loggerService.info('Execute hourly job to sync payment provider statuses', dateHelper.getUTCTimestamp())

    const payments = await this.paymentsEntityService.findByProviderStatuses(PaymentProvider.TRIPLE_A, [
      ProviderStatus.CREATED,
      ProviderStatus.PENDING
    ])

    payments.push(
      ...(await this.paymentsEntityService.findByProviderStatuses(PaymentProvider.GNOSIS_SAFE, [
        ProviderStatus.PENDING
      ]))
    )

    for (const payment of payments) {
      try {
        switch (payment.provider) {
          case PaymentProvider.GNOSIS_SAFE:
            await this.paymentsDomainService.syncSafeTransfer(payment)
            break
          case PaymentProvider.TRIPLE_A:
            await this.paymentsDomainService.syncTripleATransfer(payment)
            break
        }
      } catch (e) {
        this.loggerService.error('Error while syncing payment provider statuses', e, {
          timestamp: dateHelper.getUTCTimestamp()
        })
      }
    }

    this.loggerService.info('Completed hourly job to sync payment provider statuses', dateHelper.getUTCTimestamp())
  }

  // Runs every hour
    // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('0 * * * *')
  async handleSafePaymentWorkflows() {
    this.loggerService.info('Execute hourly job to sync stuck in executing payments', dateHelper.getUTCTimestamp())

    try {
      await this.paymentsDomainService.syncStuckInExecutingPayments()
    } catch (e) {
      this.loggerService.error('Error while syncing stuck in executing payments', e)
    }

    this.loggerService.info('Completed hourly job to sync stuck in executing payments', dateHelper.getUTCTimestamp())
  }
}
