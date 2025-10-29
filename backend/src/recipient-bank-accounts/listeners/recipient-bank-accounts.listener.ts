import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { LoggerService } from '../../shared/logger/logger.service'
import { PaymentsDomainService } from '../../payments/payments.domain.service'
import { RecipientBankAccountDeletedEvent, RecipientBankAccountEventType } from '../events/event'

@Injectable()
export class RecipientBankAccountsListener {
  constructor(private logger: LoggerService, private paymentsDomainService: PaymentsDomainService) {}

  @OnEvent(RecipientBankAccountEventType.RECIPIENT_BANK_ACCOUNT_DELETED, { async: true, promisify: true })
  async handleRecipientDeletion(event: RecipientBankAccountDeletedEvent) {
    this.logger.info(`RECIPIENT_BANK_ACCOUNT_DELETED for ${event.recipientBankAccountId}`, { event })
    try {
      await this.paymentsDomainService.syncDestinationMetadataByRecipientBankAccount(event.recipientBankAccountId)
    } catch (e) {
      this.logger.error(
        `Failed to sync payment destination metadata for recipient bank account ${event.recipientBankAccountId}: ${e.message}`,
        e,
        {
          organizationId: event.organizationId,
          event
        }
      )
    }
  }
}
