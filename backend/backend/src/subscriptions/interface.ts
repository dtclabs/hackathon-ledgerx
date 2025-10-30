import { ApiProperty } from '@nestjs/swagger'
import { Subscription } from '../shared/entity-services/subscriptions/subscription.entity'
import {
  BillingCycle,
  SubscriptionPlanName,
  SubscriptionStatus
} from '../shared/entity-services/subscriptions/interface'
import { dateHelper } from '../shared/helpers/date.helper'
import { IsEnum } from 'class-validator'

export class SubscriptionParams {
  @IsEnum(SubscriptionStatus)
  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus
}

export class SubscriptionDto {
  @IsEnum(SubscriptionPlanName)
  @ApiProperty({ enum: SubscriptionPlanName, example: SubscriptionPlanName.BUSINESS })
  planName: SubscriptionPlanName

  @IsEnum(SubscriptionStatus)
  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus

  @IsEnum(BillingCycle)
  @ApiProperty({ enum: BillingCycle, example: BillingCycle.ANNUALLY })
  billingCycle: BillingCycle

  @ApiProperty({ example: dateHelper.getUTCTimestamp() })
  startedAt: Date

  @ApiProperty({ example: dateHelper.getUTCTimestamp() })
  expiredAt: Date

  @ApiProperty()
  organizationIntegrationAddOns: any

  static map(subscription: Subscription): SubscriptionDto {
    const result = new SubscriptionDto()
    result.planName = subscription.subscriptionPlan.name
    result.status = subscription.status
    result.billingCycle = subscription.billingCycle
    result.startedAt = subscription.startedAt
    result.expiredAt = subscription.expiredAt
    result.organizationIntegrationAddOns = subscription.organizationIntegrationAddOns

    return result
  }
}
