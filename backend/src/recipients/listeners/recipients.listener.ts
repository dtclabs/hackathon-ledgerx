import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { LoggerService } from '../../shared/logger/logger.service'
import { PaymentsDomainService } from '../../payments/payments.domain.service'
import { RecipientCreatedEvent, RecipientDeletedEvent, RecipientEventType, RecipientUpdateEvent } from '../events/event'

@Injectable()
export class RecipientsListener {
  constructor(private logger: LoggerService, private paymentsDomainService: PaymentsDomainService) {}

  @OnEvent(RecipientEventType.RECIPIENT_CREATED, { async: true, promisify: true })
  async handleRecipientCreation(event: RecipientCreatedEvent) {
    this.logger.info(`RECIPIENT_CREATED for ${event.recipientId}`, { event })
    try {
      await this.paymentsDomainService.syncDestinationMetadataByRecipient(event.recipientId)
    } catch (e) {
      this.logger.error(
        `Failed to sync payment destination metadata for recipient ${event.recipientId}: ${e.message}`,
        e,
        {
          organizationId: event.organizationId,
          event
        }
      )
    }
  }

  @OnEvent(RecipientEventType.RECIPIENT_UPDATED, { async: true, promisify: true })
  async handleRecipientUpdate(event: RecipientUpdateEvent) {
    this.logger.info(`RECIPIENT_UPDATED for ${event.recipientId}`, { event })
    try {
      await this.paymentsDomainService.syncDestinationMetadataByRecipient(event.recipientId)
    } catch (e) {
      this.logger.error(
        `Failed to sync payment destination metadata for recipient ${event.recipientId}: ${e.message}`,
        e,
        {
          organizationId: event.organizationId,
          event
        }
      )
    }
  }

  @OnEvent(RecipientEventType.RECIPIENT_DELETED, { async: true, promisify: true })
  async handleRecipientDeletion(event: RecipientDeletedEvent) {
    this.logger.info(`RECIPIENT_DELETED for ${event.recipientId}`, { event })
    try {
      await this.paymentsDomainService.syncDestinationMetadataByRecipient(event.recipientId)
    } catch (e) {
      this.logger.error(
        `Failed to sync payment destination metadata for recipient ${event.recipientId}: ${e.message}`,
        e,
        {
          organizationId: event.organizationId,
          event
        }
      )
    }
  }
}
