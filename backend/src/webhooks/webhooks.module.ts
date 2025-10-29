import { Module } from '@nestjs/common'
import { WebhooksController } from './webhooks.controller'
import { WebhooksService } from './webhooks.service'
import { LoggerModule } from '../shared/logger/logger.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { FinancialTransactionsModule } from '../financial-transactions/financial-transactions.module'
import { DataOnchainIngestorModule } from '../data-onchain-ingestor/data-onchain-ingestor.module'

@Module({
  imports: [
    LoggerModule,
    WalletsEntityModule,
    FinancialTransactionsEntityModule,
    FinancialTransactionsModule,
    DataOnchainIngestorModule
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService]
})
export class WebhooksModule {}