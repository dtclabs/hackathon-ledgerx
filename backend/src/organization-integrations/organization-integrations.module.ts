import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ChartOfAccountsModule } from '../chart-of-accounts/chart-of-accounts.module'
import { RequestFinanceModule } from '../domain/integrations/request-finance/request-finance.module'
import { InvoicesModule } from '../domain/invoices/invoices.domain.module'
import { ChartOfAccountMappingsEntityModule } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { IntegrationRetryRequestEntityModule } from '../shared/entity-services/integration-retry-request/integration-retry-request.entity.module'
import { IntegrationSyncRequestsEntityModule } from '../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.module'
import { IntegrationWhitelistRequestEntityModule } from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-request.entity.module'
import { JournalEntriesEntityModule } from '../shared/entity-services/journal-entries/journal-entries.entity.module'
import { JournalEntryExportWorkflowsEntityModule } from '../shared/entity-services/journal-entry-export-workflows/journal-entry-exports.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { OrganizationIntegrationsController } from './organization-integrations.controller'
import { OrganizationIntegrationsService } from './organization-integrations.service'
import { OrganizationIntegrationsDomainModule } from '../domain/organization-integrations/organization-integrations.domain.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { DtcpayModule } from '../domain/integrations/dtcpay/dtcpay.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { IntegrationEntityModule } from '../shared/entity-services/integration/integration.entity.module'
import { TimezonesEntityModule } from '../shared/entity-services/timezones/timezones.entity.module'
import { FiatCurrenciesEntityModule } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'
import { AccountingModule } from '../domain/integrations/accounting/accounting.module'

@Module({
  imports: [
    OrganizationIntegrationsEntityModule,
    IntegrationWhitelistRequestEntityModule,
    IntegrationSyncRequestsEntityModule,
    MembersEntityModule,
    ChartOfAccountsEntityModule,
    ChartOfAccountMappingsEntityModule,
    FinancialTransactionsEntityModule,
    ConfigModule,
    JournalEntriesEntityModule,
    JournalEntryExportWorkflowsEntityModule,
    IntegrationRetryRequestEntityModule,
    AccountingModule,
    RequestFinanceModule,
    DtcpayModule,
    LoggerModule,
    InvoicesModule,
    FeatureFlagsEntityModule,
    OrganizationsEntityModule,
    SubscriptionsDomainModule,
    BlockchainsEntityModule,
    AccountsEntityModule,
    IntegrationEntityModule,
    ChartOfAccountsModule,
    OrganizationIntegrationsDomainModule,
    TimezonesEntityModule,
    FiatCurrenciesEntityModule,
    OrganizationSettingsEntityModule,
    WalletsEntityModule
  ],
  controllers: [OrganizationIntegrationsController],
  providers: [OrganizationIntegrationsService],
  exports: [OrganizationIntegrationsService]
})
export class OrganizationIntegrationsModule {}
