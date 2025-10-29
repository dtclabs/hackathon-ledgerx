import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RequestFinanceInvoice } from './request-finance-invoice.entity'
import { RequestFinanceInvoicesEntityService } from './request-finance-invoices.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([RequestFinanceInvoice])],
  providers: [RequestFinanceInvoicesEntityService],
  exports: [TypeOrmModule, RequestFinanceInvoicesEntityService]
})
export class RequestFinanceInvoicesEntityModule {}
