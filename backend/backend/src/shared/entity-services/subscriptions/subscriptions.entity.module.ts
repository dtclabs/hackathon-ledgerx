import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Subscription } from './subscription.entity'
import { SubscriptionsEntityService } from './subscriptions.entity-service'
import { SubscriptionPlan } from './subscription-plan.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), TypeOrmModule.forFeature([SubscriptionPlan])],
  controllers: [],
  providers: [SubscriptionsEntityService],
  exports: [SubscriptionsEntityService]
})
export class SubscriptionsEntityModule {}
