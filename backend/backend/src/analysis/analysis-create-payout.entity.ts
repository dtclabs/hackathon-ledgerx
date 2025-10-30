import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../core/entities/base.entity'

@Entity()
export class AnalysisCreatePayout extends BaseEntity {
  @Column({ name: 'blockchain_id', nullable: true })
  blockchainId: string

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string

  @Column({ name: 'application_name', nullable: true })
  applicationName: string

  @Column({ name: 'type', nullable: true })
  type: string

  @Column({ name: 'source_type', nullable: true })
  sourceType: string

  @Column({ name: 'source_wallet_id', nullable: true })
  sourceWalletId: string

  @Column({ name: 'source_address', nullable: true })
  sourceAddress: string

  @Column({ name: 'hash', nullable: true })
  hash: string

  @Column({ name: 'notes', nullable: true })
  notes: string

  @Column({ name: 'total_line_items', nullable: true })
  totalLineItems: number

  @Column({ name: 'line_items', type: 'json', nullable: true })
  lineItems: any

  @Column({ name: 'total_amount', nullable: true })
  totalAmount: string

  @Column({ name: 'value_at', nullable: true })
  valueAt: Date
}
