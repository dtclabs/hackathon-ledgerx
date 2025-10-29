import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'

@Entity()
export class OrganizationFullSyncRequest extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column({ name: 'executed_at', nullable: true })
  executedAt: Date

  @Column({ name: 'force_run', default: false })
  //It will run even if there are any other syncs are running
  forceRun: boolean

  static create(param: { organizationId: string; executedAt: Date; forceRun: boolean }) {
    const organizationFullSyncRequest = new OrganizationFullSyncRequest()
    organizationFullSyncRequest.organizationId = param.organizationId
    organizationFullSyncRequest.executedAt = param.executedAt
    organizationFullSyncRequest.forceRun = param.forceRun

    return organizationFullSyncRequest
  }
}
