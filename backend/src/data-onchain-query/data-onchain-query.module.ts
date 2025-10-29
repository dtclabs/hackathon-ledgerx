import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from '../shared/logger/logger.module'
import { DataOnchainQueryService } from '../data-onchain-ingestor/data-onchain-query.service'
import { DataOnchainQueryController } from '../data-onchain-ingestor/data-onchain-query.controller'

@Module({
  imports: [HttpModule, ConfigModule, LoggerModule],
  controllers: [DataOnchainQueryController],
  providers: [DataOnchainQueryService],
  exports: [DataOnchainQueryService]
})
export class DataOnchainQueryModule {}