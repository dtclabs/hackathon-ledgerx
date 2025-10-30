import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { DataOnchainIngestorController } from './data-onchain-ingestor.controller'
import { DataOnchainIngestorService } from './data-onchain-ingestor.service'
import { DataOnchainQueryService } from './data-onchain-query.service'
import { DataOnchainQueryController } from './data-onchain-query.controller'
import { LoggerModule } from '../shared/logger/logger.module'
import { TemporalModule } from '../shared/temporal/temporal.module'

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
    LoggerModule,
    TemporalModule
  ],
  controllers: [
    DataOnchainIngestorController,
    DataOnchainQueryController
  ],
  providers: [
    DataOnchainIngestorService,
    DataOnchainQueryService
  ],
  exports: [
    DataOnchainIngestorService,
    DataOnchainQueryService
  ]
})
export class DataOnchainIngestorModule {}
