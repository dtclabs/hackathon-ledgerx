import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Integration } from '../integration/integration.entity'
import { Organization } from '../organizations/organization.entity'
import { OrganizationIntegrationAuth } from './organization-integration-auth.entity'
import {
  OrganizationIntegrationOperationRemarks,
  OrganizationIntegrationStatus,
  OrganizationIntegrationMetadata
} from './interfaces'
import { Platform } from '../../../domain/integrations/accounting/interfaces'

@Entity()
@Index('UQ_conditional_organization_integration', ['organization', 'integration'], {
  unique: true,
  where: 'deleted_at is null AND platform is null'
})
@Index('UQ_conditional_integration_organization_platform', ['organization', 'integration', 'platform'], {
  unique: true,
  where: 'deleted_at is null AND platform is not null'
})
export class OrganizationIntegration extends BaseEntity {
  @Column()
  status: OrganizationIntegrationStatus

  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integration_name', referencedColumnName: 'name' })
  integration: Integration

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ type: 'json', nullable: true })
  metadata: OrganizationIntegrationMetadata

  @Column({ type: 'json', name: 'operation_remarks', nullable: true })
  operationRemarks: OrganizationIntegrationOperationRemarks

  @Column({ nullable: true, name: 'platform' })
  platform: Platform

  @OneToOne(
    () => OrganizationIntegrationAuth,
    (organizationIntegrationAuth) => organizationIntegrationAuth.organizationIntegration
  )
  organizationIntegrationAuth: OrganizationIntegrationAuth
}
