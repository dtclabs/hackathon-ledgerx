import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { Account } from '../account/account.entity'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { Organization } from '../organizations/organization.entity'
import { Wallet } from '../wallets/wallet.entity'
import {
  CurrencyType,
  DestinationMetadata,
  PaymentMetadata,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  ProviderStatus
} from './interfaces'

@Entity()
@Index('IDX_payment_source_wallet', ['sourceWallet'], {
  where: `"deleted_at" IS NULL`
})
@Index('IDX_payment_organization', ['organization'], {
  where: `"deleted_at" IS NULL`
})
export class Payment extends PublicEntity {
  @Column({ name: 'blockchain_id', nullable: true })
  blockchainId: string

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'type', nullable: true })
  type: PaymentType

  @Column({ name: 'hash', nullable: true })
  hash: string

  @Column({ name: 'safe_hash', nullable: true })
  safeHash: string

  @ManyToOne(() => Wallet, { nullable: true })
  @JoinColumn({ name: 'source_wallet_id' })
  sourceWallet: Wallet

  @Column({ name: 'destination_address', nullable: true })
  destinationAddress: string

  @Column({ name: 'destination_name', nullable: true })
  destinationName: string

  @Column({ name: 'destination_metadata', type: 'json', nullable: true })
  destinationMetadata: DestinationMetadata

  @ManyToOne(() => Cryptocurrency, { nullable: true })
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  @ManyToOne(() => Cryptocurrency, { nullable: true })
  @JoinColumn({ name: 'source_cryptocurrency_id' })
  sourceCryptocurrency: Cryptocurrency

  @Column({ name: 'destination_currency_type', nullable: true })
  destinationCurrencyType: CurrencyType

  @Column({ name: 'destination_currency_id', type: 'bigint', nullable: true })
  destinationCurrencyId: string

  @Column({ name: 'amount', nullable: true })
  amount: string

  @Column({ name: 'source_amount', nullable: true })
  sourceAmount: string

  @Column({ name: 'destination_amount', nullable: true })
  destinationAmount: string

  @Column({ name: 'fiat_value', nullable: true })
  fiatValue: string

  @Column({ name: 'status' })
  status: PaymentStatus

  @Column({ name: 'provider', nullable: true })
  provider: PaymentProvider

  @Column({ name: 'provider_status', nullable: true })
  providerStatus: ProviderStatus

  @Column({ name: 'chart_of_account_id', nullable: true })
  chartOfAccountId: string

  @Column({ name: 'annotation_public_ids', type: 'json', nullable: true })
  annotationPublicIds: string[]

  @Column({ name: 'notes', nullable: true })
  notes: string

  @Column({ name: 'remarks', nullable: true })
  remarks: string

  @Column({ name: 'files', type: 'json', nullable: true })
  files: string[]

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: PaymentMetadata

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Account

  // Needed to filter payments with no reviewer
  // Bug fixed on typeorm 0.4
  // See https://github.com/typeorm/typeorm/issues/8890
  @Column({ name: 'reviewer_id', nullable: true })
  reviewerId: string

  @Column({ name: 'last_updated_at', nullable: true })
  lastUpdatedAt: Date

  @Column({ name: 'review_requested_at', nullable: true })
  reviewRequestedAt: Date

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date

  @Column({ name: 'executed_at', nullable: true })
  executedAt: Date

  @Column({ name: 'failed_at', nullable: true })
  failedAt: Date

  @Column({ name: 'synced_at', nullable: true })
  syncedAt: Date

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: Account

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Account

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'review_requested_by' })
  reviewRequestedBy: Account

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: Account

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'executed_by' })
  executedBy: Account
}
