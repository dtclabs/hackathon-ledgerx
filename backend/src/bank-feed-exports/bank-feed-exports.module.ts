import { Module } from '@nestjs/common'
import { ChartOfAccountMappingsModule } from '../chart-of-account-mappings/chart-of-account-mappings.module'
import { JournalEntryExportWorkflowsModule } from '../domain/journal-entry-export-workflows/journal-entry-export-workflows.module'
import { FilesModule } from '../files/files.module'
import { FinancialTransactionsModule } from '../financial-transactions/financial-transactions.module'
import { BankFeedExportWorkflowsEntityModule } from '../shared/entity-services/bank-feed-export-workflows/bank-feed-export-workflows.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { ChartOfAccountMappingsEntityModule } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { GainsLossesEntityModule } from '../shared/entity-services/gains-losses/gains-losses.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { BankFeedGeneratorsDomainService } from './bank-feed-export-generators.domain.service'
import { BankFeedExportsController } from './bank-feed-exports.controller'
import { BankFeedExportsDomainService } from './bank-feed-exports.domain.service'
import { GenerateBankFeedExportsListener } from './listeners/generate-bank-feed-exports'

@Module({
  imports: [
    BankFeedExportWorkflowsEntityModule,
    JournalEntryExportWorkflowsModule,
    FinancialTransactionsEntityModule,
    LoggerModule,
    MembersEntityModule,
    FilesModule,
    BlockchainsEntityModule,
    FinancialTransactionsModule,
    OrganizationSettingsEntityModule,
    OrganizationsEntityModule,
    ChartOfAccountsEntityModule,
    ChartOfAccountMappingsModule,
    WalletsEntityModule,
    CryptocurrenciesEntityModule,
    ContactsEntityModule,
    ChartOfAccountMappingsEntityModule,
    OrganizationIntegrationsEntityModule,
    GainsLossesEntityModule
  ],
  controllers: [BankFeedExportsController],
  providers: [BankFeedExportsDomainService, GenerateBankFeedExportsListener, BankFeedGeneratorsDomainService],
  exports: []
})
export class BankFeedExportsModule {}
