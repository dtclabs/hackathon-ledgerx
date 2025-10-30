import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import {
  GnosisMultisigConfirmation,
  GnosisMultisigTransaction
} from '../../../domain/block-explorers/gnosis/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { Organization } from '../organizations/organization.entity'
import { Wallet } from '../wallets/wallet.entity'
import { PendingTransactionType } from './interfaces'

@Entity()
@Unique('UQ_pending_transaction_safe_hash_organization', ['safeHash', 'organization'])
export class PendingTransaction extends PublicEntity {
  @Column({ name: 'blockchain_id', nullable: true })
  blockchainId: string

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column()
  address: string

  @Column({ name: 'safe_hash', nullable: true })
  safeHash: string

  @Column({ name: 'notes', nullable: true })
  notes: string

  @Column({ name: 'submission_date', nullable: true })
  submissionDate: Date

  @Column({ type: 'json', name: 'safe_transaction', nullable: true })
  safeTransaction: GnosisMultisigTransaction

  @Column({ type: 'json', name: 'recipients', nullable: true })
  recipients: TransactionRecipient[]

  @Column({ nullable: true })
  nonce: number

  @Column({ nullable: true })
  confirmationsRequired: number

  @Column({ type: 'json', name: 'confirmations', nullable: true })
  confirmations: GnosisMultisigConfirmation[]

  @Column({ nullable: true })
  type: PendingTransactionType

  @Column({ nullable: true })
  error: string

  static from(params: {
    wallet: Wallet
    gnosisTx: GnosisMultisigTransaction
    recipients: TransactionRecipient[]
    notes: string
    type: PendingTransactionType
    error: string
    blockchainId: string
  }) {
    const pendingTransaction = new PendingTransaction()
    pendingTransaction.blockchainId = params.blockchainId
    pendingTransaction.organization = params.wallet.organization
    pendingTransaction.address = params.wallet.address.toLowerCase()
    pendingTransaction.safeHash = params.gnosisTx.safeTxHash
    pendingTransaction.submissionDate = dateHelper.getUTCTimestampFrom(params.gnosisTx.submissionDate)
    pendingTransaction.safeTransaction = params.gnosisTx
    pendingTransaction.recipients = params.recipients.map((recipient) => ({
      ...recipient,
      address: recipient.address.toLowerCase()
    }))
    pendingTransaction.confirmationsRequired = params.gnosisTx.confirmationsRequired
    pendingTransaction.nonce = params.gnosisTx.nonce
    pendingTransaction.confirmations = params.gnosisTx.confirmations.map((confirmation) => ({
      ...confirmation,
      owner: confirmation.owner.toLowerCase()
    }))
    pendingTransaction.notes = params.notes
    pendingTransaction.type = params.type
    pendingTransaction.error = params.error
    return pendingTransaction
  }
}

export interface TransactionRecipient {
  address: string
  amount: string
  cryptocurrencyId: string
  tokenAddress: string
  fiatAmount: string
  fiatAmountPerUnit: string
  fiatCurrency: string
  chartOfAccountId?: string
  annotationPublicIds?: string[]
  notes?: string
  files?: { filename: string; path: string }[]
}
