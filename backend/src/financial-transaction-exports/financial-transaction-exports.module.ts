import { Module } from '@nestjs/common'
import { ChartOfAccountMappingsModule } from '../chart-of-account-mappings/chart-of-account-mappings.module'
import { JournalEntryExportWorkflowsModule } from '../domain/journal-entry-export-workflows/journal-entry-export-workflows.module'
import { FilesModule } from '../files/files.module'
import { FinancialTransactionsModule } from '../financial-transactions/financial-transactions.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { FinancialTransactionExportWorkflowsEntityModule } from '../shared/entity-services/financial-transaction-export-workflows/financial-transaction-export-workflows.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { FinancialTransactionExportsController } from './financial-transaction-exports.controller'
import { FinancialTransactionExportsDomainService } from './financial-transaction-exports.domain.service'
import { FinancialTransactionGeneratorsDomainService } from './financial-transaction-export-generators.domain.service'
import { GenerateExportFromFinancialTransactionsListener } from './listeners/generate-exports-from-financial-transactions'

@Module({
  imports: [
    FinancialTransactionExportWorkflowsEntityModule,
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
    ChartOfAccountMappingsModule
  ],
  controllers: [FinancialTransactionExportsController],
  providers: [
    FinancialTransactionExportsDomainService,
    GenerateExportFromFinancialTransactionsListener,
    FinancialTransactionGeneratorsDomainService
  ],
  exports: []
})
export class FinancialTransactionExportsModule {}
