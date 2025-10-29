import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChartOfAccountMappingsModule } from '../chart-of-account-mappings/chart-of-account-mappings.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'
import { FilesModule } from '../files/files.module'
import { PendingTransactionsModule } from '../pending-transactions/pending-transactions.module'
import { AnnotationsEntityModule } from '../shared/entity-services/annotations/annotations.entity.module'
import { ResourceAnnotationsEntityModule } from '../shared/entity-services/annotations/resource-annotations/resource-annotations.entity.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { GainsLossesEntityModule } from '../shared/entity-services/gains-losses/gains-losses.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { FinancialTransactionsController } from './financial-transactions.controller'
import { FinancialTransactionsDomainService } from './financial-transactions.domain.service'
import { SolImportJob } from './sol-import-job.entity'
import { SolImportJobService } from './sol-import-job.service'
import { SolanaFakeDataService } from './solana-fake-data.service'

import { DataOnchainIngestorModule } from '../data-onchain-ingestor/data-onchain-ingestor.module'
import { WalletsModule } from '../wallets/wallets.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { WalletGroupEntityModule } from '../shared/entity-services/wallet-groups/wallet-group.entity.module'
import { CryptocurrenciesModule } from '../cryptocurrencies/cryptocurrencies.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { SolFinancialTransactionsEntityModule } from '../shared/entity-services/sol-financial-transactions/sol-financial-transactions.entity.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([SolImportJob]),
    LoggerModule,
    ConfigModule,
    HttpModule,
    FinancialTransactionsEntityModule,
    ContactsEntityModule,
    MembersEntityModule,
    FilesModule,
    OrganizationSettingsEntityModule,
    OrganizationsEntityModule,
    ChartOfAccountsEntityModule,
    ChartOfAccountMappingsModule,
    BlockchainsEntityModule,
    FeatureFlagsEntityModule,
    SubscriptionsDomainModule,
    GainsLossesEntityModule,
    PendingTransactionsModule,
    AnnotationsEntityModule,
    ResourceAnnotationsEntityModule,
    DataOnchainIngestorModule,
    WalletsModule,
    WalletsEntityModule,
    WalletGroupEntityModule,
    CryptocurrenciesModule,
    CryptocurrenciesEntityModule,
    SolFinancialTransactionsEntityModule
  ],
  controllers: [
    FinancialTransactionsController
  ],
  providers: [
    FinancialTransactionsDomainService,
    SolImportJobService,
    SolanaFakeDataService
  ],
  exports: [
    FinancialTransactionsDomainService,
    SolImportJobService
  ]
})
export class FinancialTransactionsModule {}
