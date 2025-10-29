import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FeatureFlagsController } from './feature-flags.controller'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'

@Module({
  imports: [FeatureFlagsEntityModule, ConfigModule],
  controllers: [FeatureFlagsController],
  providers: [],
  exports: []
})
export class FeatureFlagsModule {}
