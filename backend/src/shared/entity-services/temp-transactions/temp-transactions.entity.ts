import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { Category } from '../../../categories/category.entity'
import { BaseEntity } from '../../../core/entities/base.entity'
import { GnosisMultisigTransaction } from '../../../domain/block-explorers/gnosis/interfaces'
import {
  DraftTransaction,
  ETransactionType,
  FTXTransaction,
  MetamaskTransaction,
  TransactionRecipient
} from '../../../transactions/interfaces'
import { Account } from '../account/account.entity'
import { ChartOfAccount } from '../chart-of-accounts/chart-of-account.entity'

@Entity()
@Index('IDX_temp_transactions_entity_migrated_at', ['migratedAt'])
export class TempTransactionsEntity extends BaseEntity {
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category

  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'corresponding_coa_id' })
  correspondingChartOfAccount: ChartOfAccount

  @Column({ name: 'blockchain_id', nullable: true })
  blockchainId: string

  @Column({ name: 'organization_id', nullable: false })
  organizationId: string

  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'tx_creator' })
  txCreator: Account

  @Column({ nullable: true })
  comment: string

  @Column({ nullable: true })
  hash: string

  @Column({ name: 'safe_hash', nullable: true })
  safeHash: string

  @Column({ name: 'wallet_address', nullable: true })
  walletAddress: string

  @Column({ name: 'time_stamp', nullable: true })
  timeStamp: Date

  @Column({ name: 'is_executed' })
  isExecuted: boolean

  @Column({ name: 'submission_date', nullable: true })
  submissionDate: Date

  @Column({ type: 'json', name: 'metamask_transaction', nullable: true })
  metamaskTransaction: MetamaskTransaction

  @Column({ type: 'json', name: 'ftx_transaction', nullable: true })
  ftxTransaction: FTXTransaction

  @Column({ type: 'json', name: 'safe_transaction', nullable: true })
  safeTransaction: GnosisMultisigTransaction

  @Column({ type: 'json', name: 'draft_transaction', nullable: true })
  draftTransaction: DraftTransaction[]

  @Column({ type: 'json', name: 'recipients', nullable: true })
  recipients: TransactionRecipient[]

  @Column({ name: 'token_address', nullable: true })
  tokenAddress: string

  @Column({ nullable: true })
  type?: ETransactionType

  @Column({ nullable: true })
  symbol: string

  @Column({ nullable: true })
  method: string

  @Column({ name: 'is_draft', nullable: true })
  isDraft: boolean

  @Column({ nullable: true, type: 'simple-array' })
  files: string[]

  @Column({ nullable: true })
  pastUSDGasFee: string

  @Column({ name: 'migrated_at', nullable: true })
  migratedAt: Date
}
