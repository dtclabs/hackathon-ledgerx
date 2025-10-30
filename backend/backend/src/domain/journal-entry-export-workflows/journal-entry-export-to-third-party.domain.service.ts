import { HttpStatus, Injectable } from '@nestjs/common'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { FinancialTransactionParentExportStatus } from '../../shared/entity-services/financial-transactions/interfaces'
import { IntegrationName } from '../../shared/entity-services/integration/integration.entity'
import { JournalEntryStatus } from '../../shared/entity-services/journal-entries/interfaces'
import { JournalEntriesEntityService } from '../../shared/entity-services/journal-entries/journal-entries.entity-service'
import { JournalEntry } from '../../shared/entity-services/journal-entries/journal-entry.entity'
import { JournalEntryExportStatus } from '../../shared/entity-services/journal-entry-export-workflows/interfaces'
import { JournalEntryExportWorkflow } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflow.entity'
import { JournalEntryExportWorkflowEntityService } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { OrganizationIntegrationDisconnectType } from '../../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsDomainService } from '../organization-integrations/organization-integrations.domain.service'
import { AccountingService } from '../integrations/accounting/accounting.service'
import { AccountStatus } from '../integrations/accounting/interfaces'

@Injectable()
export class JournalEntryExportToThirdPartiesDomainService {
  constructor(
    private logger: LoggerService,
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService,
    private journalEntriesEntityService: JournalEntriesEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private organizationIntegrationsDomainService: OrganizationIntegrationsDomainService,
    private accountingService: AccountingService
  ) {}

  async executeWorkflow(workflow: JournalEntryExportWorkflow) {
    try {
      for (const journalEntry of workflow.journalEntries) {
        if (
          journalEntry.status === JournalEntryStatus.READY_TO_EXPORT ||
          journalEntry.status === JournalEntryStatus.RATE_LIMIT_EXCEEDED
        ) {
          await this.exportJournalEntry(journalEntry, workflow.organizationId, workflow.integrationName)
        }
      }
    } catch (error) {
      if (error?.statusCode === HttpStatus.TOO_MANY_REQUESTS) {
        return
      }
      this.logger.error(`Journal entry export workflow failed for journal entry id ${workflow.id}`, error)
      await this.journalEntryExportWorkflowEntityService.changeStatus(workflow.id, JournalEntryExportStatus.FAILED)
      return
    }

    await this.journalEntryExportWorkflowEntityService.changeStatus(workflow.id, JournalEntryExportStatus.COMPLETED)
  }

  async exportJournalEntry(journalEntry: JournalEntry, organizationId: string, integrationName: IntegrationName) {
    journalEntry.journalLines = await this.journalEntriesEntityService.findJournalLineByJournalEntryId(journalEntry.id)
    try {
      const result = await this.accountingService.postJournalEntries(journalEntry, organizationId, integrationName)
      await this.journalEntriesEntityService.updateById(journalEntry.id, {
        remoteId: result.remoteId,
        remoteCreatedAt: result.updatedAt
      })
    } catch (error) {
      if (error?.status === HttpStatus.TOO_MANY_REQUESTS) {
        this.logger.error(
          `Posting journal entry to rootfi hit rate limit for journal entry id ${journalEntry.id}`,
          error
        )
        await this.journalEntriesEntityService.updateJournalEntryWithStatusAndStatusReason(
          journalEntry.id,
          JournalEntryStatus.RATE_LIMIT_EXCEEDED,
          error.message
        )
        throw error
      } else {
        this.logger.error(
          `Posting journal entry to accounting platform failed for journal entry id ${journalEntry.id}`,
          error
        )
        await this.journalEntriesEntityService.updateJournalEntryWithStatusAndStatusReason(
          journalEntry.id,
          JournalEntryStatus.FAILED,
          error.message
        )
        await this.financialTransactionsEntityService.updateParentIdWithExportStatusAndReason(
          journalEntry.financialTransactionParent.id,
          FinancialTransactionParentExportStatus.FAILED,
          `Export to ${integrationName} failed = ` + error.statusText
        )

        // get companyInfo with latest status (forceUpdate=true)
        const companyInfo = await this.accountingService.getCompanyInfo(organizationId, integrationName, true)
        const accountStatus = await this.accountingService.getAccountStatus(
          organizationId,
          integrationName,
          companyInfo
        )

        if (accountStatus === AccountStatus.RELINK_NEEDED) {
          await this.organizationIntegrationsDomainService.disconnectIntegration(organizationId, integrationName, {
            disconnectType: OrganizationIntegrationDisconnectType.SYSTEM,
            disconnectDetails: {
              detectionEntryPoint: 'Account is in RELINK_NEEDED status when posting journal entry export'
            }
          })
        }
        return
      }
    }
    await this.journalEntriesEntityService.updateJournalEntryWithStatusAndStatusReason(
      journalEntry.id,
      JournalEntryStatus.EXPORTED
    )
    await this.financialTransactionsEntityService.updateParentIdWithExportStatusAndReason(
      journalEntry.financialTransactionParent.id,
      FinancialTransactionParentExportStatus.EXPORTED
    )
  }
}
