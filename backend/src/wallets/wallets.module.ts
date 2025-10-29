import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AssetsModule } from '../assets/assets.module'
import { BlockExplorerModule } from '../domain/block-explorers/block-explorer.module'
import { FinancialTransformationsModule } from '../domain/financial-transformations/financial-transformations.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'
import { PaymentsModule } from '../payments/payments.module'
import { PricesModule } from '../prices/prices.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { ChartOfAccountMappingsEntityModule } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { GainsLossesEntityModule } from '../shared/entity-services/gains-losses/gains-losses.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { NftsEntityModule } from '../shared/entity-services/nfts/nfts.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { PaymentsEntityModule } from '../shared/entity-services/payments/payments.entity.module'
import { PayoutsEntityModule } from '../shared/entity-services/payouts/payouts.entity.module'
import { PendingTransactionsEntityModule } from '../shared/entity-services/pending-transactions/pending-transactions.entity.module'
import { WalletGroupEntityModule } from '../shared/entity-services/wallet-groups/wallet-group.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { WhitelistedAddressesEntityModule } from '../shared/entity-services/whitelisted-addresses/whitelisted-addresses.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { WalletsListener } from './listeners/wallets.listener'
import { WalletsController } from './wallets.controller'
import { WalletsDomainService } from './wallets.domain.service'
import { DataOnchainIngestorModule } from '../data-onchain-ingestor/data-onchain-ingestor.module'
import { DataOnchainQueryModule } from '../data-onchain-query/data-onchain-query.module'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    WalletsEntityModule,
    WalletGroupEntityModule,
    MembersEntityModule,
    ContactsEntityModule,
    FinancialTransformationsModule,
    FinancialTransactionsEntityModule,
    PricesModule,
    LoggerModule,
    FeatureFlagsEntityModule,
    GainsLossesEntityModule,
    BlockchainsEntityModule,
    CryptocurrenciesEntityModule,
    BlockExplorerModule,
    PendingTransactionsEntityModule,
    AssetsModule,
    ChartOfAccountMappingsEntityModule,
    OrganizationsEntityModule,
    SubscriptionsDomainModule,
    PayoutsEntityModule,
    PaymentsEntityModule,
    PaymentsModule,
    WhitelistedAddressesEntityModule,
    NftsEntityModule,
    ConfigModule,
    DataOnchainIngestorModule,
    DataOnchainQueryModule,
    HttpModule
  ],
  controllers: [WalletsController],
  providers: [WalletsDomainService, WalletsListener],
  exports: [WalletsDomainService]
})
export class WalletsModule {}
