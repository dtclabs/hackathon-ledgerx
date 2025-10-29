import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Integration } from '../integration/integration.entity'
import { Organization } from '../organizations/organization.entity'
@Entity()
@Index('UQ_integration_whitelist_request_integrationName_organizationId', ['integrationName', 'organizationId'], {
  unique: true
})
export class IntegrationWhitelistRequest extends BaseEntity {
  @Column({ name: 'requested_by' })
  requestedBy: string

  @Column({ name: 'addressed_by', nullable: true })
  addressedBy: string

  @Column({ nullable: true })
  comment: string

  @Column({ name: 'contact_email' })
  contactEmail: string

  @Column()
  status: IntegrationWhitelistRequestStatus

  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integration_name', referencedColumnName: 'name' })
  integrationName: Integration

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organizationId: Organization
}

export enum IntegrationWhitelistRequestStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
