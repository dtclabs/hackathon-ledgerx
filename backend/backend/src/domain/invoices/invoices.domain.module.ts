import { Module } from '@nestjs/common'
import { BlockchainsEntityModule } from '../../shared/entity-services/blockchains/blockchains.entity.module'
import { FinancialTransactionsEntityModule } from '../../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { GainsLossesEntityModule } from '../../shared/entity-services/gains-losses/gains-losses.entity.module'
import { InvoicesEntityModule } from '../../shared/entity-services/invoices/invoices.entity.module'
import { RequestFinanceInvoicesEntityModule } from '../../shared/entity-services/request-finance-invoices/request-finance-invoices.entity.module'
import { RequestFinanceModule } from '../integrations/request-finance/request-finance.module'
import { InvoicesDomainService } from './invoices.domain.service'
import { OrganizationsEntityModule } from '../../shared/entity-services/organizations/organizations.entity.module'
import { DtcpayModule } from '../integrations/dtcpay/dtcpay.module'
import { OrganizationIntegrationsEntityModule } from '../../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { LoggerModule } from '../../shared/logger/logger.module'
import { DtcpayPaymentDetailsEntityModule } from '../../shared/entity-services/dtcpay-payment-details/dtcpay-payment-details.entity.module'
import { CryptocurrenciesEntityModule } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { FilesModule } from '../../files/files.module'

@Module({
  imports: [
    GainsLossesEntityModule,
    BlockchainsEntityModule,
    RequestFinanceInvoicesEntityModule,
    RequestFinanceModule,
    InvoicesEntityModule,
    CryptocurrenciesEntityModule,
    FinancialTransactionsEntityModule,
    OrganizationsEntityModule,
    OrganizationIntegrationsEntityModule,
    DtcpayPaymentDetailsEntityModule,
    DtcpayModule,
    FilesModule,
    LoggerModule
  ],
  providers: [InvoicesDomainService],
  exports: [InvoicesDomainService]
})
export class InvoicesModule {}
