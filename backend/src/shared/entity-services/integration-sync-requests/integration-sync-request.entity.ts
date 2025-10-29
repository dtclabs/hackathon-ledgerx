import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Integration } from '../integration/integration.entity'
import { Organization } from '../organizations/organization.entity'

@Entity()
export class IntegrationSyncRequest extends BaseEntity {
  @Column({ name: 'requested_by' })
  requestedBy: string

  @Column({ name: 'requested_for' })
  requestedFor: string

  @Column()
  status: IntegrationSyncRequestStatus

  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integration_name', referencedColumnName: 'name' })
  integration: Integration

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'synced_at' })
  syncedAt: Date
}

export enum IntegrationSyncRequestStatus {
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed'
}
