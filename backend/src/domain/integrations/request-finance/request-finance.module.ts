import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OrganizationIntegrationsEntityModule } from '../../../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { RequestFinanceInvoicesEntityModule } from '../../../shared/entity-services/request-finance-invoices/request-finance-invoices.entity.module'
import { LoggerModule } from '../../../shared/logger/logger.module'
import { RequestFinanceService } from './request-finance.service'

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    OrganizationIntegrationsEntityModule,
    RequestFinanceInvoicesEntityModule,
    HttpModule
  ],
  providers: [RequestFinanceService],
  exports: [RequestFinanceService]
})
export class RequestFinanceModule {}
