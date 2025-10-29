import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { keccak256 } from 'web3-utils'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { CreateFinancialTransactionPreprocessDto, FinancialTransactionPreprocessStatus } from './interfaces'

@Entity()
@Index('UQ_financial_transaction_preprocess_uniqueId', ['uniqueId'], {
  unique: true,
  where: `"deleted_at" IS NULL`
})
@Index('IDX_fin_txn_preprocess_hash_status', ['hash', 'status'], {
  where: `"deleted_at" IS NULL`
})
@Index(
  'IDX_fin_txn_preprocess_toAddr_fromAddr_blockchainId_status',
  ['toAddress', 'fromAddress', 'blockchainId', 'status'],
  {
    where: `"deleted_at" IS NULL`
  }
)
export class FinancialTransactionPreprocess extends BaseEntity {
  @Column({ name: 'unique_id' })
  uniqueId: string

  @Column()
  hash: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'from_address' }) // Will be nullable for block_rewards
  fromAddress: string

  @Column({ name: 'to_address' }) // Will be nullable for fee
  toAddress: string

  @Column({ name: 'initiator_address' })
  initiatorAddress: string

  @ManyToOne(() => Cryptocurrency)
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  @Column({ name: 'cryptocurrency_amount' })
  cryptocurrencyAmount: string

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date

  @Column({ type: 'enum', enum: FinancialTransactionPreprocessStatus })
  status: FinancialTransactionPreprocessStatus

  static createFromDto(dto: CreateFinancialTransactionPreprocessDto): FinancialTransactionPreprocess {
    const financialTransactionPreprocess = new FinancialTransactionPreprocess()

    financialTransactionPreprocess.hash = dto.hash
    financialTransactionPreprocess.blockchainId = dto.blockchainId
    financialTransactionPreprocess.fromAddress = dto.fromAddress
    financialTransactionPreprocess.toAddress = dto.toAddress
    financialTransactionPreprocess.initiatorAddress = dto.initiatorAddress
    financialTransactionPreprocess.cryptocurrency = dto.cryptocurrency
    financialTransactionPreprocess.cryptocurrencyAmount = dto.cryptocurrencyAmount
    financialTransactionPreprocess.valueTimestamp = dto.valueTimestamp
    financialTransactionPreprocess.status = dto.status

    financialTransactionPreprocess.uniqueId = this.generateUniqueId(dto.forPublicIdGeneration, dto.valueTimestamp)

    return financialTransactionPreprocess
  }

  static generateUniqueId(inputString: string, valueTimestamp: Date) {
    const keccak256hash = keccak256(inputString).replace('0x', '')
    const uniqueId = ('hq' + valueTimestamp.getTime() + keccak256hash).slice(0, 32)
    return uniqueId
  }
}
