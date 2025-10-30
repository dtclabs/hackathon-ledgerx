import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../core/entities/base.entity'

@Entity()
@Index('IDX_sol_import_job_wallet_status', ['walletPublicId', 'status'])
@Index('IDX_sol_import_job_organization', ['organizationId', 'startedAt'])
export class SolImportJob extends BaseEntity {
  @Column({ name: 'wallet_public_id' })
  walletPublicId: string

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  })
  status: 'pending' | 'running' | 'completed' | 'failed'

  @Column({ name: 'started_at' })
  startedAt: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ name: 'total_transactions', default: 0 })
  totalTransactions: number

  @Column({ name: 'processed_transactions', default: 0 })
  processedTransactions: number

  @Column({ nullable: true })
  error: string

  @Column({ type: 'json', nullable: true })
  metadata: any

  // Computed properties
  get progress(): number {
    if (this.totalTransactions === 0) return 0
    return Math.round((this.processedTransactions / this.totalTransactions) * 100)
  }

  get isActive(): boolean {
    return this.status === 'pending' || this.status === 'running'
  }

  get duration(): number | null {
    if (!this.completedAt) return null
    return this.completedAt.getTime() - this.startedAt.getTime()
  }
}