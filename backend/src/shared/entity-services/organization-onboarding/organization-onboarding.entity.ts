import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { OnboardingContactDto } from '../../../organizations/interfaces'

@Entity()
export class OrganizationOnboarding extends BaseEntity {
  @Column({ name: 'organization_id' })
  @ApiProperty()
  organizationId: string

  @Column({ type: 'json' })
  @ApiProperty()
  contact: OnboardingContactDto[]

  @Column({ name: 'job_title', nullable: true })
  jobTitle?: string
}
