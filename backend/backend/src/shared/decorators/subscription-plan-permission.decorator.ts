import { SetMetadata } from '@nestjs/common'

export const REQUIRE_SUBSCRIPTION_PLAN_PERMISSION_KEY = 'require_subscription_plan_permission'
export const BYPASS_SUBSCRIPTION_PLAN_PERMISSION_KEY = 'bypass_require_subscription_plan_permission'

export const RequireSubscriptionPlanPermission = (subscriptionPlanPermission: string) =>
  SetMetadata(REQUIRE_SUBSCRIPTION_PLAN_PERMISSION_KEY, subscriptionPlanPermission)

export const BypassSubscriptionPlanPermission = () => SetMetadata(BYPASS_SUBSCRIPTION_PLAN_PERMISSION_KEY, true)
