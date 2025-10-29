import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ChartOfAccountMappingsEntityModule } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { IntegrationSyncRequestsEntityModule } from '../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { ChartOfAccountsController } from './chart-of-accounts.controller'
import { ChartOfAccountsService } from './chart-of-accounts.service'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { OrganizationIntegrationsDomainModule } from '../domain/organization-integrations/organization-integrations.domain.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'
import { AccountingModule } from '../domain/integrations/accounting/accounting.module'

@Module({
  imports: [
    ConfigModule,
    ChartOfAccountsEntityModule,
    ChartOfAccountMappingsEntityModule,
    OrganizationIntegrationsEntityModule,
    FinancialTransactionsEntityModule,
    IntegrationSyncRequestsEntityModule,
    MembersEntityModule,
    AccountingModule,
    LoggerModule,
    FeatureFlagsEntityModule,
    OrganizationsEntityModule,
    SubscriptionsDomainModule,
    OrganizationIntegrationsDomainModule
  ],
  controllers: [ChartOfAccountsController],
  providers: [ChartOfAccountsService],
  exports: [ChartOfAccountsService]
})
export class ChartOfAccountsModule {}
