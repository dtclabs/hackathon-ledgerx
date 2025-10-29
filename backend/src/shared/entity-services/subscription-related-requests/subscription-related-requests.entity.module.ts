import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionRelatedRequest } from './subscription-related-request.entity'
import { SubscriptionRelatedRequestsEntityService } from './subscription-related-requests.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionRelatedRequest])],
  controllers: [],
  providers: [SubscriptionRelatedRequestsEntityService],
  exports: [SubscriptionRelatedRequestsEntityService]
})
export class SubscriptionRelatedRequestsEntityModule {}
