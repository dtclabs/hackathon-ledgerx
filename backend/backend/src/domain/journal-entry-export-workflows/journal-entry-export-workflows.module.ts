import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BlockchainsEntityModule } from '../../shared/entity-services/blockchains/blockchains.entity.module'
import { ChartOfAccountMappingsEntityModule } from '../../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ContactsEntityModule } from '../../shared/entity-services/contacts/contacts.entity.module'
import { FeatureFlagsEntityModule } from '../../shared/entity-services/feature-flags/feature-flags.entity.module'
import { FinancialTransactionsEntityModule } from '../../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { GainsLossesEntityModule } from '../../shared/entity-services/gains-losses/gains-losses.entity.module'
import { JournalEntriesEntityService } from '../../shared/entity-services/journal-entries/journal-entries.entity-service'
import { JournalEntriesEntityModule } from '../../shared/entity-services/journal-entries/journal-entries.entity.module'
import { JournalEntryExportWorkflowsEntityModule } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-exports.entity.module'
import { OrganizationIntegrationsEntityService } from '../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { OrganizationIntegrationsEntityModule } from '../../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { WalletsEntityModule } from '../../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../../shared/logger/logger.module'
import { ChartOfAccountRulesDomainModule } from '../chart-of-account-rules/chart-of-account-rules.domain.module'
import { OrganizationIntegrationsDomainModule } from '../organization-integrations/organization-integrations.domain.module'
import { JournalEntryExportToThirdPartiesDomainService } from './journal-entry-export-to-third-party.domain.service'
import { JournalEntryExportWorkflowsDomainService } from './journal-entry-export-workflows.domain.service'
import { JournalEntryGeneratorsDomainService } from './journal-entry-generators.domain.service'
import { ExportToThirdPartyListener } from './listeners/export-to-third-party'
import { GenerateFromFinancialTransactionsListener } from './listeners/generate-from-financial-transactions'
import { AccountingModule } from '../integrations/accounting/accounting.module'

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    JournalEntryExportWorkflowsEntityModule,
    JournalEntriesEntityModule,
    FinancialTransactionsEntityModule,
    WalletsEntityModule,
    FeatureFlagsEntityModule,
    OrganizationIntegrationsEntityModule,
    JournalEntriesEntityModule,
    ChartOfAccountMappingsEntityModule,
    ChartOfAccountRulesDomainModule,
    ContactsEntityModule,
    AccountingModule,
    BlockchainsEntityModule,
    OrganizationIntegrationsDomainModule,
    GainsLossesEntityModule
  ],
  providers: [
    JournalEntryExportWorkflowsDomainService,
    GenerateFromFinancialTransactionsListener,
    ExportToThirdPartyListener,
    ConfigService,
    OrganizationIntegrationsEntityService,
    JournalEntriesEntityService,
    JournalEntryGeneratorsDomainService,
    JournalEntryExportToThirdPartiesDomainService
  ],
  exports: [JournalEntryExportWorkflowsDomainService]
})
export class JournalEntryExportWorkflowsModule {}
