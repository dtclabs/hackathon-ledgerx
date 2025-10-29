import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../../../shared/entity-services/feature-flags/interfaces'
import { JournalEntryStatus } from '../../../shared/entity-services/journal-entries/interfaces'
import { JournalEntryExportStatus } from '../../../shared/entity-services/journal-entry-export-workflows/interfaces'
import { JournalEntryExportWorkflowEntityService } from '../../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import { JournalEntryExportEventType } from '../events/events'
import { JournalEntryGeneratorsDomainService } from '../journal-entry-generators.domain.service'

@Injectable()
export class GenerateFromFinancialTransactionsListener {
  constructor(
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService,
    private journalEntryGeneratorsDomainService: JournalEntryGeneratorsDomainService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService
  ) {}

  @OnEvent(JournalEntryExportEventType.GENERATE_FROM_FINANCIAL_TRANSACTION, { async: true, promisify: true })
  async generateFromFinancialTransactions(workflowId: string) {
    if (await this.featureFlagsService.isFeatureEnabled(FeatureFlagOption.XERO_EXPORT)) {
      let workflow = await this.journalEntryExportWorkflowEntityService.getById(workflowId, {
        journalEntries: { journalLines: true, financialTransactionParent: true }
      })

      try {
        if (workflow.status === JournalEntryExportStatus.GENERATING) {
          await this.journalEntryExportWorkflowEntityService.updateLastExecutedAt(workflow.id)

          await this.journalEntryGeneratorsDomainService.executeWorkflow(workflow)

          workflow = await this.journalEntryExportWorkflowEntityService.getById(workflow.id, { journalEntries: true })
          if (workflow.status === JournalEntryExportStatus.GENERATING) {
            let successfulCount = 0
            let failedCount = 0

            for (const journalEntry of workflow.journalEntries) {
              if (journalEntry.status === JournalEntryStatus.FAILED) {
                failedCount++
              } else if (journalEntry.status === JournalEntryStatus.READY_TO_EXPORT) {
                successfulCount++
              }
            }

            const finalStatus =
              successfulCount === 0 ? JournalEntryExportStatus.COMPLETED : JournalEntryExportStatus.GENERATED

            await this.journalEntryExportWorkflowEntityService.changeStatus(workflow.id, finalStatus, {
              generatedAt: dateHelper.getUTCTimestamp(),
              generatedSuccessfulCount: successfulCount,
              generatedFailedCount: failedCount
            })
          }
        }
      } catch (e) {
        await this.journalEntryExportWorkflowEntityService.changeStatus(
          workflowId,
          JournalEntryExportStatus.GENERATING_FAILED,
          { error: e }
        )
        this.logger.error(`Journal Entry Export generateFromFinancialTransaction workflow ${workflowId} has errors`, e)
      }
    }
  }
}
