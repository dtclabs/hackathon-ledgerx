import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { InvoicesModule } from '../invoices/invoices.domain.module'
import { ChartOfAccountsEntityModule } from '../../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { FinancialTransactionsEntityModule } from '../../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { IntegrationRetryRequestEntityModule } from '../../shared/entity-services/integration-retry-request/integration-retry-request.entity.module'
import { IntegrationSyncRequestsEntityModule } from '../../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.module'
import { JournalEntriesEntityModule } from '../../shared/entity-services/journal-entries/journal-entries.entity.module'
import { JournalEntryExportWorkflowsEntityModule } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-exports.entity.module'
import { OrganizationIntegrationsEntityModule } from '../../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { OrganizationIntegrationsDomainService } from './organization-integrations.domain.service'
import { LoggerModule } from '../../shared/logger/logger.module'
import { AccountingModule } from '../integrations/accounting/accounting.module'
import { RootfiMigrationListener } from './listeners/rootfi-migration'
import { FeatureFlagsEntityModule } from '../../shared/entity-services/feature-flags/feature-flags.entity.module'

@Module({
  imports: [
    AccountingModule,
    ConfigModule,
    InvoicesModule,
    JournalEntriesEntityModule,
    ChartOfAccountsEntityModule,
    FinancialTransactionsEntityModule,
    IntegrationRetryRequestEntityModule,
    IntegrationSyncRequestsEntityModule,
    OrganizationIntegrationsEntityModule,
    JournalEntryExportWorkflowsEntityModule,
    LoggerModule,
    FeatureFlagsEntityModule
  ],
  providers: [OrganizationIntegrationsDomainService, RootfiMigrationListener],
  exports: [OrganizationIntegrationsDomainService]
})
export class OrganizationIntegrationsDomainModule {}
