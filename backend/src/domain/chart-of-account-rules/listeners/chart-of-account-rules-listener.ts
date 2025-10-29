import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { LoggerService } from '../../../shared/logger/logger.service'
import { ChartOfAccountRulesDomainService } from '../chart-of-account-rules.domain.service'
import { ChartOfAccountRulesEventTypes, SyncUnmappedFinancialTransactionEvent } from './interfaces'

@Injectable()
export class ChartOfAccountRulesListener {
  constructor(
    private logger: LoggerService,
    private chartOfAccountRulesDomainService: ChartOfAccountRulesDomainService
  ) {}

  @OnEvent(ChartOfAccountRulesEventTypes.SYNC_UNMAPPED_FINANCIAL_TRANSACTIONS, { async: true, promisify: true })
  async handleSyncUnmappedFinancialTransactionEvents(event: SyncUnmappedFinancialTransactionEvent) {
    try {
      this.logger.info(`SYNC_UNMAPPED_FINANCIAL_TRANSACTIONS is running for organization ${event?.organizationId}`, {
        event
      })
      await this.chartOfAccountRulesDomainService.syncUnmappedFinancialTransactionsByOrganization(event.organizationId)
    } catch (e) {
      this.logger.error(
        `SYNC_UNMAPPED_FINANCIAL_TRANSACTIONS failed for wallet ${event?.organizationId}: ${e.message}`,
        e,
        {
          event
        }
      )
    }
  }
}
