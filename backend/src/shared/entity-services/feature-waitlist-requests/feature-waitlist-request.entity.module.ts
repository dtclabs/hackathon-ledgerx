import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeatureWaitlistRequest } from './feature-waitlist-requests.entity'
import { FeatureWaitlistRequestsEntityService } from './feature-waitlist-requests.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([FeatureWaitlistRequest])],
  providers: [FeatureWaitlistRequestsEntityService],
  exports: [TypeOrmModule, FeatureWaitlistRequestsEntityService]
})
export class FeatureWaitlistRequestsEntityModule {}
