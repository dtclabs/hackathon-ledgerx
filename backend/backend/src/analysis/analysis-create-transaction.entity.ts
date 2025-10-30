import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../core/entities/base.entity'
import { CreateAnalysisCreateTransactionDto } from './interface'

@Entity()
export class AnalysisCreateTransaction extends BaseEntity {
  @Column({ name: 'organization_id', nullable: true })
  organizationId: string

  @Column({ name: 'from_wallet_id', nullable: true })
  fromWalletId: string

  @Column({ name: 'from_address', nullable: true })
  fromAddress: string

  @Column({ name: 'value_at' })
  valueAt: Date

  @Column({ nullable: true })
  hash: string

  @Column({ name: 'cryptocurrency_id' })
  cryptocurrencyId: string

  @Column({ name: 'total_amount' })
  totalAmount: string

  @Column({ name: 'total_recipient', nullable: true })
  totalRecipient: number

  @Column({ type: 'json', nullable: true })
  recipients: any

  @Column({ name: 'blockchain_id', nullable: true })
  blockchainId: string

  @Column({ name: 'application_name', nullable: true })
  applicationName: string

  @Column({ type: 'json', nullable: true })
  categories: any

  @Column({ type: 'json', nullable: true })
  correspondingChartOfAccounts: any

  @Column({ type: 'json', nullable: true })
  notes: any

  @Column({ type: 'json', nullable: true })
  attachments: any

  static map(dto: CreateAnalysisCreateTransactionDto): AnalysisCreateTransaction {
    const createTransaction = new AnalysisCreateTransaction()
    createTransaction.organizationId = dto.organizationId
    createTransaction.fromWalletId = dto.fromWalletId
    createTransaction.fromAddress = dto.fromAddress
    createTransaction.valueAt = dto.valueAt
    createTransaction.hash = dto.hash
    createTransaction.cryptocurrencyId = dto.cryptocurrencyId
    createTransaction.totalAmount = dto.totalAmount
    createTransaction.totalRecipient = dto.totalRecipient
    createTransaction.recipients = dto.recipients
    createTransaction.blockchainId = dto.blockchainId
    createTransaction.applicationName = dto.applicationName
    createTransaction.categories = dto.categories
    createTransaction.correspondingChartOfAccounts = dto.correspondingChartOfAccounts
    createTransaction.notes = dto.notes
    createTransaction.attachments = dto.attachments

    return createTransaction
  }
}
