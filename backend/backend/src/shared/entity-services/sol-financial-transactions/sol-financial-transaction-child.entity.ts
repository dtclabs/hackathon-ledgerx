import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { SolFinancialTransactionChildMetadata } from './sol-financial-transaction-child-metadata.entity'
import { SolFinancialTransactionParent } from './sol-financial-transaction-parent.entity'
import { CreateSolFinancialTransactionChildDto } from './interfaces'

@Entity()
@Index('UQ_sol_financial_transaction_child_publicId_organizationId', ['publicId', 'organizationId'], {
  unique: true,
  where: `"deleted_at" IS NULL`
})
@Index(
  'IDX_sol_fin_txn_child_toAddr_fromAddr_orgId_blockchainId',
  ['toAddress', 'fromAddress', 'organizationId', 'blockchainId'],
  {
    where: `"deleted_at" IS NULL`
  }
)
@Index('IDX_sol_fin_txn_child_hash', ['hash'], {
  where: `"deleted_at" IS NULL`
})
@Index('IDX_sol_fin_txn_child_parent_id', ['solFinancialTransactionParent'], {
  where: `"deleted_at" IS NULL`
})
export class SolFinancialTransactionChild extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  hash: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'from_address', nullable: true })
  fromAddress: string

  @Column({ name: 'to_address', nullable: true })
  toAddress: string

  @Column({ name: 'token_address', nullable: true })
  tokenAddress: string

  @ManyToOne(() => Cryptocurrency)
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  @Column({ name: 'cryptocurrency_amount' })
  cryptocurrencyAmount: string

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string

  @ManyToOne(() => SolFinancialTransactionParent, (parent) => parent.solFinancialTransactionChild)
  @JoinColumn({ name: 'sol_financial_transaction_parent_id' })
  solFinancialTransactionParent: SolFinancialTransactionParent

  @OneToOne(() => SolFinancialTransactionChildMetadata, (metadata) => metadata.solFinancialTransactionChild)
  solFinancialTransactionChildMetadata: SolFinancialTransactionChildMetadata

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string

  @Column({ name: 'instruction_index', nullable: true })
  instructionIndex: number

  static createFromDto(dto: CreateSolFinancialTransactionChildDto): SolFinancialTransactionChild {
    const entity = new SolFinancialTransactionChild()
    entity.publicId = dto.publicId
    entity.hash = dto.hash
    entity.blockchainId = dto.blockchainId
    entity.fromAddress = dto.fromAddress
    entity.toAddress = dto.toAddress
    entity.tokenAddress = dto.tokenAddress
    entity.cryptocurrency = dto.cryptocurrency
    entity.cryptocurrencyAmount = dto.cryptocurrencyAmount
    entity.valueTimestamp = dto.valueTimestamp
    entity.organizationId = dto.organizationId
    entity.solFinancialTransactionParent = dto.solFinancialTransactionParent
    entity.transactionId = dto.transactionId
    entity.instructionIndex = dto.instructionIndex
    return entity
  }
}