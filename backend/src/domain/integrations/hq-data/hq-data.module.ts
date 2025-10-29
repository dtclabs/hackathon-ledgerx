import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FeatureFlagsEntityModule } from '../../../shared/entity-services/feature-flags/feature-flags.entity.module'
import { LoggerModule } from '../../../shared/logger/logger.module'
import { HqDataNftService } from './hq-data-nft.service'
import { HqDataService } from './hq-data.service'

@Module({
  imports: [LoggerModule, ConfigModule, HttpModule, FeatureFlagsEntityModule],
  providers: [HqDataService, HqDataNftService],
  exports: [HqDataService, HqDataNftService]
})
export class HqDataModule {}
