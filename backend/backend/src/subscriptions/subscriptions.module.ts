import { Module } from '@nestjs/common'
import { SubscriptionsController } from './subscriptions.controller'
import { SubscriptionsService } from './subscriptions.service'
import { SubscriptionsEntityModule } from '../shared/entity-services/subscriptions/subscriptions.entity.module'

@Module({
  imports: [SubscriptionsEntityModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: []
})
export class SubscriptionsModule {}
