import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InvoicesDomainService } from '../invoices/invoices.domain.service'
import { ChartOfAccountsEntityService } from '../../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { IntegrationRetryRequestEntityService } from '../../shared/entity-services/integration-retry-request/integration-retry-request.entity.service'
import { IntegrationSyncRequestsEntityService } from '../../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.service'
import { JournalEntriesEntityService } from '../../shared/entity-services/journal-entries/journal-entries.entity-service'
import { JournalEntryExportWorkflowEntityService } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { OrganizationIntegrationsEntityService } from '../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { IntegrationName } from '../../shared/entity-services/integration/integration.entity'
import { FinancialTransactionParentExportStatus } from '../../shared/entity-services/financial-transactions/interfaces'
import { COASource } from '../../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import {
  OrganizationIntegrationOperationRemarks,
  OrganizationIntegrationStatus
} from '../../shared/entity-services/organization-integrations/interfaces'
import { accountingIntegrations } from '../../organization-integrations/interfaces'
import { LoggerService } from '../../shared/logger/logger.service'
import { AccountingService } from '../integrations/accounting/accounting.service'

@Injectable()
export class OrganizationIntegrationsDomainService {
  constructor(
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private integrationSyncRequestsService: IntegrationSyncRequestsEntityService,
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService,
    private journalEntriesEntityService: JournalEntriesEntityService,
    private integrationRetryRequestEntityService: IntegrationRetryRequestEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private invoicesDomainService: InvoicesDomainService,
    private accountingService: AccountingService,
    private loggerService: LoggerService
  ) {}

  async disconnectIntegration(
    organizationId: string,
    integrationName: IntegrationName,
    operationRemarks?: OrganizationIntegrationOperationRemarks
  ) {
    const platform = await this.accountingService.getAvailablePlatformName(organizationId, integrationName)
    const isRootfiAvailable = await this.accountingService.isRootFiAvailable(organizationId)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName,
        organizationId,
        relations: { integration: true, organizationIntegrationAuth: true },
        platform: platform
      })
    if (!organizationIntegration) {
      throw new NotFoundException(`Can not find organization integration`)
    }
    if (organizationIntegration.status === OrganizationIntegrationStatus.INITIATED) {
      throw new BadRequestException(`Integration is not in token swapped or completed state`)
    }
    if (!organizationIntegration.organizationIntegrationAuth) {
      throw new NotFoundException(`Can not find organization integration auth`)
    }

    //TODO:Refactor this to a common xero module
    if (accountingIntegrations.includes(integrationName)) {
      const journalEntryWorkflows =
        await this.journalEntryExportWorkflowEntityService.getJournalEntryExportWorkflowsByOrganization({
          organizationId,
          integrationName,
          relations: { journalEntries: true }
        })

      const journalEntryWorkflowIds = []
      const journalEntryIds = []

      for (const workflow of journalEntryWorkflows) {
        journalEntryWorkflowIds.push(workflow.id)
        for (const journalEntry of workflow?.journalEntries) {
          journalEntryIds.push(journalEntry?.id)
        }
      }

      await this.financialTransactionsEntityService.updateParentByOrganizationWithExportStatusAndReason(
        organizationId,
        FinancialTransactionParentExportStatus.UNEXPORTED
      )
      await this.chartOfAccountsEntityService.updateChartOfAccounts(
        organizationId,
        integrationName,
        COASource.HQ,
        isRootfiAvailable
      )
      await this.integrationSyncRequestsService.deleteIntegrationSyncRequest({
        integration: { name: integrationName },
        organization: { id: organizationId }
      })
      await this.journalEntriesEntityService.softDeleteByJournalEntryIds(journalEntryIds)
      await this.journalEntryExportWorkflowEntityService.softDeleteByJournalEntryWorkflowIds(journalEntryWorkflowIds)
      try {
        await this.accountingService.deleteLinkedAccount(
          organizationId,
          organizationIntegration.organizationIntegrationAuth?.rootfiOrgId,
          organizationIntegration.organizationIntegrationAuth?.accessToken
        )
      } catch (e) {
        // Skip if account no longer exists on Merge
        this.loggerService.info('Error deleting linked account on Merge', e, {
          organizationId: organizationId,
          integrationName: integrationName
        })
      }
    } else if (integrationName === IntegrationName.REQUEST_FINANCE) {
      await this.invoicesDomainService.softDeleteRequestFinanceForOrganization(organizationId)
    } else if (integrationName === IntegrationName.DTCPAY)
      await this.invoicesDomainService.softDeleteDtcpayForOrganization(organizationId)

    await this.integrationRetryRequestEntityService.deleteByOrganizationAndIntegration(organizationId, integrationName)
    await this.organizationIntegrationsEntityService.updateOrganizationIntegrationById(organizationIntegration.id, {
      operationRemarks
    })
    await this.organizationIntegrationsEntityService.softDeleteById(organizationIntegration.id)
  }
}
