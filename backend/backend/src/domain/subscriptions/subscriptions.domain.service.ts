import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SubscriptionsEntityService } from '../../shared/entity-services/subscriptions/subscriptions.entity-service'
import {
  SubscriptionPlanName,
  SubscriptionPlanPermissionName
} from '../../shared/entity-services/subscriptions/interface'
import { IntegrationName } from '../../shared/entity-services/integration/integration.entity'

@Injectable()
export class SubscriptionsDomainService {
  constructor(
    private subscriptionsEntityService: SubscriptionsEntityService,
    private configService: ConfigService
  ) {}

  async hasActive(organizationId: string, plans: SubscriptionPlanName[]) {
    // Allow all subscription plans in development mode
    if (this.configService.get('DEVELOPMENT_MODE') === 'true' || this.configService.get('SKIP_SUBSCRIPTION_CHECKS') === 'true') {
      return true
    }

    const subscription = await this.subscriptionsEntityService.getActiveSubscription(organizationId)
    if (subscription) {
      return plans.includes(subscription.subscriptionPlan.name)
    } else {
      return false
    }
  }

  async hasIntegration(organizationId: string, integrationName: IntegrationName) {
    // Allow all integrations in development mode
    if (this.configService.get('DEVELOPMENT_MODE') === 'true' || this.configService.get('ALLOW_ALL_INTEGRATIONS') === 'true') {
      return true
    }

    const subscription = await this.subscriptionsEntityService.getActiveSubscription(organizationId)
    if (subscription) {
      return subscription.organizationIntegrationAddOns?.[integrationName]
    } else {
      return false
    }
  }

  async hasPermission(organizationId: string, subscriptionPlanPermission: SubscriptionPlanPermissionName) {
    // Allow all permissions in development mode
    if (this.configService.get('DEVELOPMENT_MODE') === 'true' || this.configService.get('SKIP_SUBSCRIPTION_CHECKS') === 'true') {
      return true
    }

    const subscription = await this.subscriptionsEntityService.getActiveSubscription(organizationId)

    if (!subscription) return false

    const permission = (await subscription.subscriptionPlan.subscriptionPlanPermissions).find(
      (permission) => permission.name === subscriptionPlanPermission
    )

    return !!permission
  }
}
