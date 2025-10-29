import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { PortfolioController } from './portfolio.controller'
import { PortfolioService } from './portfolio.service'
import { HeliusService } from './helius.service'
import { SolanaFinancialTransactionsService } from './solana-financial-transactions.service'
import { PortfolioPosition, PortfolioTransaction } from './portfolio.entity'
import {
  PortfolioPositionsEntityService,
  PortfolioTransactionsEntityService
} from './entity-services/portfolio.entity-service'
import { LoggerModule } from '../shared/logger/logger.module'
import { DataOnchainIngestorModule } from '../data-onchain-ingestor/data-onchain-ingestor.module'
import { PricesModule } from '../prices/prices.module'
import { WalletsModule } from '../wallets/wallets.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { FinancialTransactionsModule } from '../financial-transactions/financial-transactions.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { CryptocurrenciesModule } from '../cryptocurrencies/cryptocurrencies.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { BlockchainsModule } from '../blockchains/blockchains.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([PortfolioPosition, PortfolioTransaction]),
    HttpModule,
    ConfigModule,
    LoggerModule,
    DataOnchainIngestorModule,
    PricesModule,
    WalletsModule,
    WalletsEntityModule,
    FinancialTransactionsModule,
    FinancialTransactionsEntityModule,
    CryptocurrenciesModule,
    CryptocurrenciesEntityModule,
    BlockchainsModule,
    BlockchainsEntityModule
  ],
  controllers: [PortfolioController],
  providers: [
    PortfolioService,
    HeliusService,
    SolanaFinancialTransactionsService,
    PortfolioPositionsEntityService,
    PortfolioTransactionsEntityService
  ],
  exports: [
    PortfolioService,
    HeliusService,
    SolanaFinancialTransactionsService,
    PortfolioPositionsEntityService,
    PortfolioTransactionsEntityService
  ]
})
export class PortfolioModule {}
