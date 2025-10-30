import { Module } from '@nestjs/common'
import { JournalEntryExportWorkflowsModule } from '../domain/journal-entry-export-workflows/journal-entry-export-workflows.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { JournalEntryExportWorkflowsEntityModule } from '../shared/entity-services/journal-entry-export-workflows/journal-entry-exports.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { JournalEntryExportsController } from './journal-entry-exports.controller'
import { JournalEntryExportsDomainService } from './journal-entry-exports.domain.service'
import { AccountingModule } from '../domain/integrations/accounting/accounting.module'

@Module({
  imports: [
    AccountingModule,
    JournalEntryExportWorkflowsEntityModule,
    JournalEntryExportWorkflowsModule,
    OrganizationIntegrationsEntityModule,
    FinancialTransactionsEntityModule,
    LoggerModule,
    MembersEntityModule
  ],
  controllers: [JournalEntryExportsController],
  providers: [JournalEntryExportsDomainService],
  exports: []
})
export class JournalEntryExportsModule {}
