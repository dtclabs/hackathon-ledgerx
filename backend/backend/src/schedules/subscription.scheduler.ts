import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { SubscriptionsEntityService } from '../shared/entity-services/subscriptions/subscriptions.entity-service'
import { LessThan, Not } from 'typeorm'
import { SubscriptionStatus } from '../shared/entity-services/subscriptions/interface'

@Injectable()
export class SubscriptionScheduler {
  constructor(private subscriptionsEntityService: SubscriptionsEntityService, private loggerService: LoggerService) {}

  // Runs every day at 1 am (SGT)
  @Cron('0 1 * * *', { utcOffset: 8 })
  async expireSubscriptionsDailyJob() {
    this.loggerService.info('Execute daily job to expire subscriptions', dateHelper.getUTCTimestamp())

    const subscriptions = await this.subscriptionsEntityService.find({
      where: { expiredAt: LessThan(dateHelper.getUTCTimestamp()), status: Not(SubscriptionStatus.EXPIRED) }
    })

    for (const subscription of subscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED
      await this.subscriptionsEntityService.update(subscription)
    }

    this.loggerService.info('Completed daily job to expire subscriptions', dateHelper.getUTCTimestamp())
  }
}
