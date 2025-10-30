import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  BYPASS_SUBSCRIPTION_PLAN_PERMISSION_KEY,
  REQUIRE_SUBSCRIPTION_PLAN_PERMISSION_KEY
} from '../decorators/subscription-plan-permission.decorator'
import { PUBLIC_ORGANIZATION_ID_PARAM } from '../../core/interceptors/get-private-organization-id.interceptor'
import { OrganizationsEntityService } from '../entity-services/organizations/organizations.entity-service'
import { SubscriptionPlanPermissionName } from '../entity-services/subscriptions/interface'
import { SubscriptionsDomainService } from '../../domain/subscriptions/subscriptions.domain.service'

@Injectable()
export class SubscriptionPlanPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private organizationsEntityService: OrganizationsEntityService,
    private subscriptionsDomainService: SubscriptionsDomainService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bypassSubscriptionPlanPermission = this.reflector.getAllAndOverride<boolean>(
      BYPASS_SUBSCRIPTION_PLAN_PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (bypassSubscriptionPlanPermission === true) return true

    const subscriptionPlanPermission = this.reflector.getAllAndOverride<SubscriptionPlanPermissionName>(
      REQUIRE_SUBSCRIPTION_PLAN_PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (!subscriptionPlanPermission) return true

    const { params } = context.switchToHttp().getRequest()
    const publicOrganizationId = params[PUBLIC_ORGANIZATION_ID_PARAM]

    if (!publicOrganizationId) return false

    const organization = await this.organizationsEntityService.findByPublicId(publicOrganizationId)
    return this.subscriptionsDomainService.hasPermission(organization.id, subscriptionPlanPermission)
  }
}
