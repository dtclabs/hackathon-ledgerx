import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { AssetTransfersWithMetadataResult } from 'alchemy-sdk/dist/src/types/types'
import { Column, Entity, Index } from 'typeorm'
import { hexToNumber } from 'web3-utils'
import { BaseEntity } from '../../../core/entities/base.entity'
import { RawTransactionTaskStatusEnum, TransactionStatus } from './interfaces'

@Entity()
@Index('UQ_raw_transaction_hash_blockchainId_address', ['hash', 'blockchainId', 'address'], { unique: true })
@Index('IDX_raw_transaction_address_blockchainId_status', ['address', 'blockchainId', 'status'], {
  where: `"deleted_at" IS NULL`
})
export class RawTransaction extends BaseEntity {
  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column()
  hash: string

  @Column()
  address: string

  @Column({ name: 'block_number' })
  blockNumber: string

  @Column({ name: 'block_number_int' })
  blockNumberInt: number

  @Column({ name: 'block_timestamp' })
  blockTimestamp: string

  // @Deprecated
  @Column({ name: 'ingestion_task_id' })
  ingestionTaskId: string

  @Column({ name: 'ingestion_process_id', nullable: true })
  ingestionProcessId: string

  @Column({ type: 'json', nullable: true })
  receipt: TransactionReceipt

  @Column({ type: 'json', nullable: true })
  to: AssetTransfersWithMetadataResult[]

  @Column({ type: 'json', nullable: true })
  from: AssetTransfersWithMetadataResult[]

  @Column({ type: 'json', nullable: true })
  internal: AssetTransfersWithMetadataResult[]

  @Column({
    default: RawTransactionTaskStatusEnum.RUNNING
  })
  status: RawTransactionTaskStatusEnum = RawTransactionTaskStatusEnum.RUNNING

  @Column({ name: 'transaction_status' })
  transactionStatus: TransactionStatus

  @Column({ name: 'transaction_status_reason', nullable: true })
  transactionStatusReason: string

  static create(params: {
    hash: string
    address: string
    blockchainId: string
    receipt?: any
    to?: any[]
    from?: any[]
    internal?: any[]
    ingestionTaskId?: string
    ingestionProcessId: string
    blockNumber: string
    blockTimestamp: string
    transactionStatus: TransactionStatus
    transactionStatusReason: string
  }): RawTransaction {
    const rawTransaction = new RawTransaction()
    rawTransaction.address = params.address
    rawTransaction.hash = params.hash
    rawTransaction.blockchainId = params.blockchainId
    rawTransaction.ingestionTaskId = params.ingestionTaskId
    rawTransaction.ingestionProcessId = params.ingestionTaskId
    rawTransaction.receipt = params.receipt ?? null
    rawTransaction.to = params.to ?? null
    rawTransaction.from = params.from ?? null
    rawTransaction.internal = params.internal ?? null
    rawTransaction.blockNumber = params.blockNumber
    rawTransaction.blockNumberInt = Number(hexToNumber(params.blockNumber))
    rawTransaction.blockTimestamp = params.blockTimestamp
    rawTransaction.transactionStatus = params.transactionStatus
    rawTransaction.transactionStatusReason = params.transactionStatusReason
    return rawTransaction
  }
}
