import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThan, LessThanOrEqual, MoreThan, Repository } from 'typeorm'
import { Subscription } from './subscription.entity'
import { BillingCycle, SubscriptionPlanName, SubscriptionPlanPermissionName, SubscriptionStatus } from './interface'
import { BaseEntityService } from '../base.entity-service'
import { dateHelper } from '../../helpers/date.helper'
import { Organization } from '../organizations/organization.entity'
import { SubscriptionPlan } from './subscription-plan.entity'
import { IntegrationName } from '../integration/integration.entity'

@Injectable()
export class SubscriptionsEntityService extends BaseEntityService<Subscription> {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlansRepository: Repository<SubscriptionPlan>
  ) {
    super(subscriptionsRepository)
  }

  async createFreeTrial(organization: Organization) {
    await this.create({
      organization: organization,
      subscriptionPlan: await this.subscriptionPlansRepository.findOne({
        where: { name: SubscriptionPlanName.FREE_TRIAL }
      }),
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.NOT_APPLICABLE,
      startedAt: dateHelper.getUTCTimestamp(),
      expiredAt: dateHelper.getUTCTimestampForward({ days: 30 })
    })
  }

  // Returns 1 active subscription
  // If there are multiple subscriptions, take the first subscription in the order of BUSINESS, FREE_TRIAL, STARTER
  async getActiveSubscription(organizationId: string) {
    const currentTimestamp = dateHelper.getUTCTimestamp()
    const subscriptions = await this.subscriptionsRepository.find({
      where: {
        // Cancelled plan is still active during grace period
        status: In([SubscriptionStatus.CANCELLED, SubscriptionStatus.ACTIVE]),
        startedAt: LessThanOrEqual(currentTimestamp),
        expiredAt: MoreThan(currentTimestamp),
        organization: {
          id: organizationId
        }
      },
      relations: {
        subscriptionPlan: true
      },
      cache: 10000
    })

    const subscription = subscriptions.sort((s1, s2) => {
      // Sort tiers from lowest to highest to account for -1
      const tiers = [SubscriptionPlanName.STARTER, SubscriptionPlanName.FREE_TRIAL, SubscriptionPlanName.BUSINESS]
      return tiers.indexOf(s1.subscriptionPlan.name) > tiers.indexOf(s2.subscriptionPlan.name) ? -1 : 1
    })?.[0]

    if (subscription) {
      const defaultIntegrations =
        (await subscription.subscriptionPlan.subscriptionPlanPermissions).find(
          (subscriptionPlanPermission) =>
            subscriptionPlanPermission.name === SubscriptionPlanPermissionName.INTEGRATIONS
        )?.restrictions?.integrations ?? []

      subscription.organizationIntegrationAddOns = subscription.organizationIntegrationAddOns ?? {}

      for (const integrationName of Object.values(IntegrationName)) {
        subscription.organizationIntegrationAddOns[integrationName] =
          subscription.organizationIntegrationAddOns?.[integrationName] ?? defaultIntegrations.includes(integrationName)
      }
    }

    return subscription
  }

  async getLastSubscription(organizationId: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: {
        expiredAt: LessThan(dateHelper.getUTCTimestamp()),
        status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED, SubscriptionStatus.CANCELLED]),
        organization: {
          id: organizationId
        }
      },
      relations: {
        subscriptionPlan: true
      },
      order: { expiredAt: 'DESC' }
    })

    if (!subscription) return null

    // Update status if not expired
    if (subscription.status != SubscriptionStatus.EXPIRED) {
      subscription.status = SubscriptionStatus.EXPIRED
      await this.subscriptionsRepository.save(subscription)
    }

    const defaultIntegrations =
      (await subscription.subscriptionPlan.subscriptionPlanPermissions).find(
        (subscriptionPlanPermission) => subscriptionPlanPermission.name === SubscriptionPlanPermissionName.INTEGRATIONS
      )?.restrictions?.integrations ?? []

    subscription.organizationIntegrationAddOns = subscription.organizationIntegrationAddOns ?? {}

    for (const integrationName of Object.values(IntegrationName)) {
      subscription.organizationIntegrationAddOns[integrationName] =
        subscription.organizationIntegrationAddOns?.[integrationName] ?? defaultIntegrations.includes(integrationName)
    }

    return subscription
  }
}
