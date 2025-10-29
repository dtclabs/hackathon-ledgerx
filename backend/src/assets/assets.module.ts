import { Module } from '@nestjs/common'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { GainsLossesEntityModule } from '../shared/entity-services/gains-losses/gains-losses.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { PricesModule } from '../prices/prices.module'
import { AssetsController } from './assets.controller'
import { AssetsDomainService } from './assets.domain.service'
import { LoggerModule } from '../shared/logger/logger.module'
import { TaxLotsModule } from '../domain/tax-lots/tax-lots.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    FinancialTransactionsEntityModule,
    PricesModule,
    CryptocurrenciesEntityModule,
    GainsLossesEntityModule,
    MembersEntityModule,
    WalletsEntityModule,
    LoggerModule,
    TaxLotsModule,
    BlockchainsEntityModule,
    FeatureFlagsEntityModule,
    OrganizationsEntityModule,
    SubscriptionsDomainModule
  ],
  controllers: [AssetsController],
  providers: [AssetsDomainService],
  exports: [AssetsDomainService]
})
export class AssetsModule {}
