import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { TripleATransferResponse } from '../../../domain/integrations/triple-a/interfaces'

@Entity()
@Index('UQ_triple_a_transfer_transfer_id', ['transferId'], {
  unique: true,
  where: `"deleted_at" IS NULL`
})
@Index('IDX_triple_a_transfer_quote_id', ['quoteId'])
@Index('IDX_triple_a_transfer_payment_id', ['paymentId'])
export class TripleATransfer extends BaseEntity {
  @Column({ name: 'payment_id', type: 'bigint' })
  paymentId: string

  @Column({ name: 'quote_id', nullable: true })
  quoteId: string

  @Column({ name: 'transfer_id', nullable: true })
  transferId: string

  @Column({ name: 'status', nullable: true })
  status: string

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date

  @Column({ name: 'transfer', type: 'json' })
  transfer: TripleATransferResponse

  @Column({ type: 'json', nullable: true })
  error: {
    response: unknown
    retryCount: number
  }

  private static RETRY_LIMIT = 3

  isRetryable(): boolean {
    const retryCount = this.error?.retryCount ?? 0
    return retryCount < TripleATransfer.RETRY_LIMIT
  }
}
