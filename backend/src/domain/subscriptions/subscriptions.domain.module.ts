import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SubscriptionsDomainService } from './subscriptions.domain.service'
import { SubscriptionsEntityModule } from '../../shared/entity-services/subscriptions/subscriptions.entity.module'

@Module({
  imports: [SubscriptionsEntityModule, ConfigModule],
  providers: [SubscriptionsDomainService],
  exports: [SubscriptionsDomainService]
})
export class SubscriptionsDomainModule {}
