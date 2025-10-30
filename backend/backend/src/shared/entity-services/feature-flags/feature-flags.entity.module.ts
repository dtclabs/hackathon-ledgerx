import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeatureFlag } from './feature-flag.entity'
import { FeatureFlagsEntityService } from './feature-flags.entity-service'
import { LoggerModule } from '../../logger/logger.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag]), LoggerModule, ConfigModule],
  providers: [FeatureFlagsEntityService],
  exports: [TypeOrmModule, FeatureFlagsEntityService]
})
export class FeatureFlagsEntityModule {}
