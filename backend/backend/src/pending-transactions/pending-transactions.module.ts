import { Module } from '@nestjs/common'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { PendingTransactionsDomainService } from './pending-transactions.domain.service'
import { PendingTransactionsController } from './pending-transactions.controller'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { PendingTransactionsEntityModule } from '../shared/entity-services/pending-transactions/pending-transactions.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'

@Module({
  imports: [
    PendingTransactionsEntityModule,
    ContactsEntityModule,
    CryptocurrenciesEntityModule,
    WalletsEntityModule,
    ChartOfAccountsEntityModule,
    BlockchainsEntityModule,
    MembersEntityModule,
    FeatureFlagsEntityModule
  ],
  controllers: [PendingTransactionsController],
  providers: [PendingTransactionsDomainService],
  exports: [PendingTransactionsDomainService]
})
export class PendingTransactionsModule {}
