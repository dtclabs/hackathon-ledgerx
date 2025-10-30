import { BadRequestException, Injectable } from '@nestjs/common'
import { JournalEntryExportWorkflowsDomainService } from '../domain/journal-entry-export-workflows/journal-entry-export-workflows.domain.service'
import { FinancialTransactionQueryExportParams } from '../financial-transactions/interfaces'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import {
  JOURNAL_ENTRY_EXPORT_TERMINAL_STATUSES,
  JournalEntryExportStatus,
  JournalEntryExportType
} from '../shared/entity-services/journal-entry-export-workflows/interfaces'
import { JournalEntryExportWorkflow } from '../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflow.entity'
import { JournalEntryExportWorkflowEntityService } from '../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { OrganizationIntegrationStatus } from '../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsEntityService } from '../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import { JournalEntryExportDto } from './interfaces'
import { AccountingService } from '../domain/integrations/accounting/accounting.service'

@Injectable()
export class JournalEntryExportsDomainService {
  constructor(
    private logger: LoggerService,
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService,
    private journalEntryExportWorkflowsDomainService: JournalEntryExportWorkflowsDomainService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private accountingService: AccountingService
  ) {}

  async getJournalEntryExportsForOrganization(
    organizationId: string,
    integrationName?: IntegrationName,
    statuses?: JournalEntryExportStatus[]
  ): Promise<JournalEntryExportDto[]> {
    const journalEntryExports =
      await this.journalEntryExportWorkflowEntityService.getJournalEntryExportWorkflowsByOrganization({
        organizationId,
        integrationName,
        statuses
      })

    if (journalEntryExports?.length) {
      // This is pagination and product spec hack below.
      // We only want 1 ongoing/non-completed item and limited number of completed items
      let maxNonCompletedCount = 1
      let maxCompletedCount = 4

      const filteredExports: JournalEntryExportWorkflow[] = []

      for (const journalEntryExport of journalEntryExports) {
        if (!JOURNAL_ENTRY_EXPORT_TERMINAL_STATUSES.includes(journalEntryExport.status)) {
          if (maxNonCompletedCount === 0) {
            if (maxCompletedCount === 0) {
              break
            }
            continue
          }
          filteredExports.push(journalEntryExport)

          maxNonCompletedCount--
        } else if (JOURNAL_ENTRY_EXPORT_TERMINAL_STATUSES.includes(journalEntryExport.status)) {
          if (maxCompletedCount === 0) {
            if (maxNonCompletedCount === 0) {
              break
            }
            continue
          }
          filteredExports.push(journalEntryExport)
          maxCompletedCount--
        }
      }

      return filteredExports.map((journalEntryExport) => JournalEntryExportDto.map(journalEntryExport))
    }
  }

  async createJournalEntryExport(params: {
    organizationId: string
    requestedBy: string
    integrationName: IntegrationName
    type: JournalEntryExportType
    financialTransactionParentPublicIds?: string[]
    queryParams: FinancialTransactionQueryExportParams
  }): Promise<JournalEntryExportDto> {
    const platform = await this.accountingService.getAvailablePlatformName(
      params.organizationId,
      params.integrationName
    )
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: params.integrationName,
        organizationId: params.organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED],
        platform: platform
      })

    if (!organizationIntegration) {
      throw new BadRequestException('Organization is not authorized for the requested integration')
    }

    const workflow = await this.journalEntryExportWorkflowsDomainService.initiateNewWorkflow(params)

    return JournalEntryExportDto.map(workflow)
  }

  async abortJournalEntryExport(params: {
    journalEntryExportWorkflowPublicId: string
    organizationId: string
  }): Promise<JournalEntryExportDto> {
    const workflow = await this.journalEntryExportWorkflowsDomainService.abortGeneratedWorkflow(params)

    return JournalEntryExportDto.map(workflow)
  }

  async exportJournalEntryExport(params: {
    journalEntryExportWorkflowPublicId: string
    organizationId: string
  }): Promise<JournalEntryExportDto> {
    const workflow = await this.journalEntryExportWorkflowsDomainService.exportGeneratedWorkflow(params)

    return JournalEntryExportDto.map(workflow)
  }

  async cancelJournalEntryExport(params: {
    journalEntryExportWorkflowPublicId: string
    organizationId: string
  }): Promise<JournalEntryExportDto> {
    const workflow = await this.journalEntryExportWorkflowsDomainService.cancelExportingWorkflow(params)

    return JournalEntryExportDto.map(workflow)
  }
}
