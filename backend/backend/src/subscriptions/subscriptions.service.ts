import { BadRequestException, Injectable } from '@nestjs/common'
import { SubscriptionDto } from './interface'
import { SubscriptionsEntityService } from '../shared/entity-services/subscriptions/subscriptions.entity-service'
import { SubscriptionStatus } from '../shared/entity-services/subscriptions/interface'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptionsEntityService: SubscriptionsEntityService) {}

  async getSubscription(organizationId: string, status: SubscriptionStatus) {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        const subscription =
          (await this.subscriptionsEntityService.getActiveSubscription(organizationId)) ??
          (await this.subscriptionsEntityService.getLastSubscription(organizationId))
        return !subscription ? null : SubscriptionDto.map(subscription)
      default:
        throw new BadRequestException('Invalid status')
    }
  }
}
