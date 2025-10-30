import { Column, Entity, OneToMany, Unique } from 'typeorm'
import { SubscriptionPlanPermission } from './subscription-plan-permission.entity'
import { BaseEntity } from '../../../core/entities/base.entity'
import { SubscriptionPlanName } from './interface'

@Entity()
@Unique('UQ_subscription_plan_name', ['name'])
export class SubscriptionPlan extends BaseEntity {
  @Column()
  name: SubscriptionPlanName

  @OneToMany(
    () => SubscriptionPlanPermission,
    (subscriptionPlanPermission) => subscriptionPlanPermission.subscriptionPlan
  )
  subscriptionPlanPermissions: Promise<SubscriptionPlanPermission[]>
}
