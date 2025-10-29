import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { OnboardingType, OnboardingStatus } from './interfaces'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Organization } from '../organizations/organization.entity'
import { OnboardingStep } from './onboarding-step.entity'

@Entity()
@Index('UQ_onboarding_org_id_type', ['organization', 'type'], { unique: true })
export class Onboarding extends BaseEntity {
  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'status', nullable: false })
  status: OnboardingStatus

  @Column({ name: 'type', nullable: false })
  type: OnboardingType

  @OneToMany(() => OnboardingStep, (onboardingStep) => onboardingStep.onboarding)
  @JoinColumn({ name: 'onboarding_id' })
  onboardingSteps: OnboardingStep[]
}
