import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { FinancialTransactionParent } from '../financial-transactions/financial-transaction-parent.entity'
import { Organization } from '../organizations/organization.entity'
import {
  CounterpartyMetadata,
  DtcpaySourceMetadata,
  InvoiceDetails,
  InvoiceItem,
  InvoiceMetadata,
  InvoiceRole,
  InvoiceSource,
  InvoiceStatus
} from './interfaces'

@Entity()
@Index('UQ_source_id_source_organization_id', ['sourceId', 'source', 'organization'], {
  unique: true,
  where: 'deleted_at IS NULL'
})
@Index('UQ_invoice_number_source_organization_id', ['invoiceNumber', 'source', 'organization'], {
  unique: true,
  where: `role = 'seller' AND deleted_at IS NULL`
})
export class Invoice extends PublicEntity {
  @ManyToOne(() => FinancialTransactionParent)
  @JoinColumn({ name: 'financial_transaction_parent_id' })
  financialTransactionParent: FinancialTransactionParent

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column()
  source: InvoiceSource

  @Column({ name: 'source_metadata', nullable: true, type: 'json' })
  sourceMetadata: DtcpaySourceMetadata

  @Column({ name: 'source_id', nullable: true })
  sourceId: string

  @Column({ name: 'invoice_number' })
  invoiceNumber: string

  @Column({ name: 'status', default: InvoiceStatus.CREATED })
  status: InvoiceStatus

  @Column({ name: 'from_metadata', type: 'json' })
  fromMetadata: CounterpartyMetadata

  @Column({ name: 'to_metadata', type: 'json', nullable: true })
  toMetadata: CounterpartyMetadata

  @Column({ name: 'invoice_details', type: 'json' })
  invoiceDetails: InvoiceDetails

  @Column({ nullable: true })
  counterpartyName: string

  @Column({ nullable: true })
  counterpartyEmail: string

  @Column({ type: 'json', nullable: true })
  items: InvoiceItem[]

  @Column()
  currency: string

  @Column({ name: 'total_amount' })
  totalAmount: string

  @Column()
  role: InvoiceRole

  @Column({ name: 'view_url', nullable: true })
  viewUrl: string

  @Column({ name: 'issued_at', nullable: true })
  issuedAt: Date

  @Column({ name: 'due_at', nullable: true })
  dueAt: Date

  @Column({ name: 'expired_at', nullable: true })
  expiredAt: Date

  @Column({ nullable: true, type: 'json' })
  metadata: InvoiceMetadata
}
