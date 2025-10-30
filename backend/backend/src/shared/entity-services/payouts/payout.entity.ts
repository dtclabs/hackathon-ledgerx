import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { Organization } from '../organizations/organization.entity'
import { Account } from '../account/account.entity'
import { LineItem, PayoutMetadata, PayoutStatus, PayoutType } from './interfaces'
import { Wallet } from '../wallets/wallet.entity'

@Entity()
@Index('IDX_payout_source_wallet', ['sourceWallet'], {
  where: `"deleted_at" IS NULL`
})
@Index('IDX_payout_organization', ['organization'], {
  where: `"deleted_at" IS NULL`
})
export class Payout extends PublicEntity {
  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @ManyToOne(() => Wallet, { nullable: false })
  @JoinColumn({ name: 'source_wallet_id' })
  sourceWallet: Wallet

  @Column({ name: 'type' })
  type: PayoutType

  @Column({ name: 'hash', nullable: true })
  hash: string

  @Column({ name: 'safe_hash', nullable: true })
  safeHash: string

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: PayoutMetadata

  @Column({ name: 'status' })
  status: PayoutStatus

  @Column({ name: 'line_items', type: 'json' })
  lineItems: LineItem[]

  @Column({ name: 'notes', nullable: true })
  notes: string

  @Column({ name: 'executed_at', nullable: true })
  executedAt: Date

  @Column({ name: 'synced_at', nullable: true })
  syncedAt: Date

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: Account

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Account

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'executed_by' })
  executedBy: Account
}
