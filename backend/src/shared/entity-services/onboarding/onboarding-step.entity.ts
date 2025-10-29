import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { OwnerAddressMetadata, KYBMetadata, OnboardingStepStatus, OnboardingStepType } from './interfaces'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Onboarding } from './onboarding.entity'

@Entity()
@Index('UQ_onboarding_step_onboarding_id_type', ['onboarding', 'type'], { unique: true })
export class OnboardingStep extends BaseEntity {
  @ManyToOne(() => Onboarding, { nullable: false })
  @JoinColumn({ name: 'onboarding_id' })
  onboarding: Onboarding

  @Column({ name: 'type', nullable: false })
  type: OnboardingStepType

  @Column({ name: 'status', nullable: false })
  status: OnboardingStepStatus

  @Column({ name: 'metadata', type: 'json', nullable: false })
  metadata: OwnerAddressMetadata | KYBMetadata
}
