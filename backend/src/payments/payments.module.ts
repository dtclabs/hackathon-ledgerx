import { Module } from '@nestjs/common'
import { BlockExplorerModule } from '../domain/block-explorers/block-explorer.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'
import { FilesModule } from '../files/files.module'
import { AnnotationsEntityModule } from '../shared/entity-services/annotations/annotations.entity.module'
import { ResourceAnnotationsEntityModule } from '../shared/entity-services/annotations/resource-annotations/resource-annotations.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { PaymentsEntityModule } from '../shared/entity-services/payments/payments.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { PaymentsController } from './payments.controller'
import { PaymentsDomainService } from './payments.domain.service'
import { FiatCurrenciesEntityModule } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity.module'
import { RecipientBankAccountsEntityModule } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-accounts.entity.module'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { TripleAModule } from '../domain/integrations/triple-a/triple-a.module'
import { TripleATransfersEntityModule } from '../shared/entity-services/triple-a-transfers/triple-a-transfers.entity.module'

@Module({
  imports: [
    PaymentsEntityModule,
    CryptocurrenciesEntityModule,
    FiatCurrenciesEntityModule,
    RecipientBankAccountsEntityModule,
    WalletsEntityModule,
    MembersEntityModule,
    ContactsEntityModule,
    FilesModule,
    LoggerModule,
    BlockExplorerModule,
    FinancialTransactionsEntityModule,
    ChartOfAccountsEntityModule,
    AnnotationsEntityModule,
    ResourceAnnotationsEntityModule,
    FeatureFlagsEntityModule,
    OrganizationsEntityModule,
    OrganizationIntegrationsEntityModule,
    SubscriptionsDomainModule,
    TripleAModule,
    TripleATransfersEntityModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsDomainService],
  exports: [PaymentsDomainService]
})
export class PaymentsModule {}
