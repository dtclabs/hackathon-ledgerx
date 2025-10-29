import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../../../shared/entity-services/feature-flags/interfaces'
import { JournalEntryStatus } from '../../../shared/entity-services/journal-entries/interfaces'
import { JournalEntryExportStatus } from '../../../shared/entity-services/journal-entry-export-workflows/interfaces'
import { JournalEntryExportWorkflowEntityService } from '../../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import { JournalEntryExportEventType } from '../events/events'
import { JournalEntryExportToThirdPartiesDomainService } from '../journal-entry-export-to-third-party.domain.service'
@Injectable()
export class ExportToThirdPartyListener {
  MERGE_ACCESS_TOKEN: string
  constructor(
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService,
    private journalEntryExportToThirdPartiesDomainService: JournalEntryExportToThirdPartiesDomainService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService
  ) {
    this.MERGE_ACCESS_TOKEN = this.configService.get('MERGE_ACCESS_TOKEN')
  }

  @OnEvent(JournalEntryExportEventType.EXPORT_TO_THIRD_PARTY, { async: true, promisify: true })
  async exportToThirdParty(workflowId: string) {
    if (await this.featureFlagsService.isFeatureEnabled(FeatureFlagOption.XERO_EXPORT)) {
      let workflow = await this.journalEntryExportWorkflowEntityService.getById(workflowId, {
        journalEntries: { journalLines: true, financialTransactionParent: true }
      })

      try {
        if (workflow.status === JournalEntryExportStatus.EXPORTING) {
          await this.journalEntryExportWorkflowEntityService.updateLastExecutedAt(workflow.id)

          await this.journalEntryExportToThirdPartiesDomainService.executeWorkflow(workflow)

          workflow = await this.journalEntryExportWorkflowEntityService.getById(workflow.id, { journalEntries: true })
        }

        if ([JournalEntryExportStatus.COMPLETED, JournalEntryExportStatus.CANCELLED].includes(workflow.status)) {
          let successfulCount = 0
          let failedCount = 0
          for (const journalEntry of workflow.journalEntries) {
            if (journalEntry.status === JournalEntryStatus.EXPORTED) {
              successfulCount++
            } else if (journalEntry.status === JournalEntryStatus.FAILED) {
              failedCount++
            }
          }

          const finalStatus: JournalEntryExportStatus =
            workflow.status !== JournalEntryExportStatus.CANCELLED
              ? JournalEntryExportStatus.COMPLETED
              : JournalEntryExportStatus.CANCELLED

          await this.journalEntryExportWorkflowEntityService.changeStatus(workflow.id, finalStatus, {
            exportedAt: dateHelper.getUTCTimestamp(),
            exportedSuccessfulCount: successfulCount,
            exportedFailedCount: failedCount
          })
        }
      } catch (e) {
        await this.journalEntryExportWorkflowEntityService.updateError(workflowId, e.stack ?? e.message ?? e)
        await this.journalEntryExportWorkflowEntityService.changeStatus(workflow.id, JournalEntryExportStatus.FAILED)
        this.logger.error(`Journal Entry Export exportToThirdParty workflow ${workflowId} has errors`, e)
      }
    }
  }
}
