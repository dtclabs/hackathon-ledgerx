import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'

@Entity()
export class OrganizationTrial extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column()
  status: OrganizationTrialStatus

  @Column({ name: 'expired_at' })
  expiredAt: Date
}

export enum OrganizationTrialStatus {
  PAID = 'paid',
  FREE_TRIAL = 'free_trial'
}
