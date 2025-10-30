import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { OrganizationIntegration } from './organization-integration.entity'
import { DtcpayAuthMetadata } from './interfaces'

@Entity()
export class OrganizationIntegrationAuth extends BaseEntity {
  @Column({ name: 'access_token', nullable: true })
  accessToken: string

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string

  @Column({ name: 'expired_at', nullable: true })
  expiredAt: Date

  @Column({ nullable: true, type: 'json' })
  metadata: DtcpayAuthMetadata

  @Column({ name: 'rootfi_org_id', nullable: true })
  rootfiOrgId: number

  @OneToOne(() => OrganizationIntegration)
  @JoinColumn({ name: 'organization_integration_id' })
  organizationIntegration: OrganizationIntegration
}
