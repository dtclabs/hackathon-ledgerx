import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { SubscriptionPlan } from './subscription-plan.entity'
import { SubscriptionPlanPermissionName } from './interface'

@Entity()
@Unique('UQ_subscription_plan_permission_plan_permission_name', ['subscriptionPlan', 'name'])
export class SubscriptionPlanPermission extends BaseEntity {
  @ManyToOne(() => SubscriptionPlan, (subscriptionPlan) => subscriptionPlan.subscriptionPlanPermissions, {
    nullable: false
  })
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlan

  @Column()
  name: SubscriptionPlanPermissionName

  @Column({ type: 'json', nullable: true })
  restrictions: any
}
