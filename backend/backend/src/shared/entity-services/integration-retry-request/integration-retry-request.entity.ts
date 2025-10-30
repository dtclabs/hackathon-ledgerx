import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Integration } from '../integration/integration.entity'
import { Organization } from '../organizations/organization.entity'

@Entity()
export class IntegrationRetryRequest extends BaseEntity {
  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integration_name', referencedColumnName: 'name' })
  integration: Integration

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'retry_count', nullable: true })
  retryCount: number

  @Column({ name: 'retry_at', nullable: true })
  retryAt: Date
}
