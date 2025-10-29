import { Module } from '@nestjs/common'
import { RequestFinanceModule } from '../domain/integrations/request-finance/request-finance.module'
import { InvoicesModule as InvoicesDomainModule } from '../domain/invoices/invoices.domain.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { InvoicesEntityModule } from '../shared/entity-services/invoices/invoices.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { InvoicesController } from './invoices.controller'

@Module({
  imports: [
    LoggerModule,
    InvoicesEntityModule,
    RequestFinanceModule,
    MembersEntityModule,
    FinancialTransactionsEntityModule,
    BlockchainsEntityModule,
    InvoicesDomainModule
  ],
  controllers: [InvoicesController],
  providers: []
})
export class InvoicesModule {}
