import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'

@Entity()
export class Integration extends BaseEntity {
  @Column({ unique: true })
  name: IntegrationName

  @Column({ name: 'integration_id', unique: true, nullable: true })
  integrationId: string

  @Column({ name: 'display_name' })
  displayName: string

  @Column({ nullable: true })
  image: string

  @Column()
  status: IntegrationStatus

  @Column({ nullable: true })
  website: string

  @Column({ name: 'important_links', nullable: true })
  importantLinks: string
}

export enum IntegrationName {
  XERO = 'xero',
  REQUEST_FINANCE = 'request_finance',
  QUICKBOOKS = 'quickbooks',
  DTCPAY = 'dtcpay',
  TRIPLE_A = 'triple_a'
}

export enum IntegrationStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}
