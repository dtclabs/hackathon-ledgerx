import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { GenerateMerchantQrResponse, QueryPaymentDetailResponse } from '../../../domain/integrations/dtcpay/interfaces'

@Entity()
@Index('UQ_transaction_id_organization_id', ['transactionId', 'organizationId'], {
  unique: true,
  where: `deleted_at IS NULL`
})
export class DtcpayPaymentDetail extends BaseEntity {
  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string

  @Column({ name: 'invoice_id', type: 'bigint', nullable: true })
  invoiceId: string

  @Column({ name: 'transaction_id' })
  transactionId: string

  @Column({ name: 'state', nullable: true })
  state: number

  @Column({ name: 'reference_no', nullable: true })
  referenceNo: string

  @Column({ name: 'request_currency', nullable: true })
  requestCurrency: string

  @Column({ name: 'processing_amount', nullable: true })
  processingAmount: string

  @Column({ name: 'processing_currency', nullable: true })
  processingCurrency: string

  @Column({ name: 'dtc_timestamp', nullable: true })
  dtcTimestamp: Date

  @Column({ name: 'last_updated_time', nullable: true })
  lastUpdatedTime: Date

  @Column({ name: 'raw_data', type: 'json' })
  rawData: GenerateMerchantQrResponse | QueryPaymentDetailResponse
}
