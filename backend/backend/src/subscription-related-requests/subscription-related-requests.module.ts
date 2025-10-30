import { Module } from '@nestjs/common'
import { SubscriptionRelatedRequestsEntityModule } from '../shared/entity-services/subscription-related-requests/subscription-related-requests.entity.module'
import { SubscriptionRelatedRequestsController } from './subscription-related-requests.controller'
import { SubscriptionRelatedRequestsDomainService } from './subscription-related-requests.domain.service'

@Module({
  imports: [SubscriptionRelatedRequestsEntityModule],
  controllers: [SubscriptionRelatedRequestsController],
  providers: [SubscriptionRelatedRequestsDomainService],
  exports: []
})
export class SubscriptionRelatedRequestsModule {}
