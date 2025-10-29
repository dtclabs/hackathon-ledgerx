import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { RequestFinanceInvoiceResponse } from '../../../domain/integrations/request-finance/interfaces'
import { RequestFinanceInvoiceRole, RequestFinanceInvoiceStatus } from './interfaces'

@Entity()
@Index('UQ_request_invoice_organizationId_requestId', ['organizationId', 'requestId'], {
  unique: true,
  where: `"deleted_at" IS NULL`
})
@Index('IDX_request_invoice_organizationId_transactionHash', ['organizationId', 'transactionHash'], {
  where: `"deleted_at" IS NULL`
})
@Index('IDX_request_invoice_organizationId_status', ['organizationId', 'status'], {
  where: `"deleted_at" IS NULL`
})
export class RequestFinanceInvoice extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column({ name: 'request_id' })
  requestId: string

  @Column({ name: 'invoice_number' })
  invoiceNumber: string

  @Column({ name: 'creation_date' })
  creationDate: Date

  @Column({ name: 'transaction_hash', nullable: true })
  transactionHash: string

  @Column({ name: 'request_blockchain_id', nullable: true })
  requestBlockchainId: string

  @Column()
  status: RequestFinanceInvoiceStatus

  @Column()
  role: RequestFinanceInvoiceRole

  @Column({ name: 'is_linked', default: false })
  isLinked: boolean

  @Column({ name: 'raw_data', type: 'json' })
  rawData: RequestFinanceInvoiceResponse
}
