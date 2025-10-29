import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BillingCycle, SubscriptionStatus } from './interface'
import { SubscriptionPlan } from './subscription-plan.entity'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Organization } from '../organizations/organization.entity'

@Entity()
export class Subscription extends BaseEntity {
  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @ManyToOne(() => SubscriptionPlan, { nullable: false })
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlan

  @Column({ name: 'billing_cycle' })
  billingCycle: BillingCycle

  @Column()
  status: SubscriptionStatus

  @Column({ name: 'started_at' })
  startedAt: Date

  @Column({ name: 'expired_at' })
  expiredAt: Date

  @Column({ name: 'organization_integration_add_ons', type: 'json', nullable: true })
  organizationIntegrationAddOns: { [key: string]: boolean }
}
