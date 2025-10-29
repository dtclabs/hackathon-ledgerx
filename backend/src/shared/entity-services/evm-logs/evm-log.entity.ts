import { Column, Entity, Unique } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { hexToNumber } from 'web3-utils'

@Entity()
@Unique(['blockchainId', 'transactionHash', 'logIndex'])
export class EvmLog extends BaseEntity {
  @Column({ name: 'contract_address' })
  contractAddress: string

  @Column({ name: 'block_hash' })
  blockHash: string

  @Column({ name: 'block_number' })
  blockNumber: number

  @Column({ name: 'block_timestamp' })
  blockTimestamp: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'transaction_hash' })
  transactionHash: string

  @Column({ name: 'log_index' })
  logIndex: number

  @Column({ name: 'topic0' })
  topic0: string

  @Column({ name: 'topic1', nullable: true })
  topic1: string

  @Column({ name: 'topic2', nullable: true })
  topic2: string

  @Column({ name: 'topic3', nullable: true })
  topic3: string

  @Column()
  data: string

  @Column({ name: 'initiator_address', nullable: true })
  initiatorAddress: string

  static create(params: {
    contractAddress: string
    blockHash: string
    blockNumber: string
    blockTimestamp: string
    blockchainId: string
    transactionHash: string
    logIndex: string
    topic0: string
    topic1: string
    topic2: string
    topic3: string
    data: string
    initiatorAddress: string
  }): EvmLog {
    const ethereumLog = new EvmLog()
    ethereumLog.contractAddress = params.contractAddress.toLowerCase()
    ethereumLog.blockHash = params.blockHash
    ethereumLog.blockNumber = Number(hexToNumber(params.blockNumber))
    ethereumLog.blockTimestamp = params.blockTimestamp
    ethereumLog.blockchainId = params.blockchainId
    ethereumLog.transactionHash = params.transactionHash
    ethereumLog.logIndex = Number(hexToNumber(params.logIndex))
    ethereumLog.topic0 = params.topic0
    ethereumLog.topic1 = params.topic1
    ethereumLog.topic2 = params.topic2
    ethereumLog.topic3 = params.topic3
    ethereumLog.data = params.data
    ethereumLog.initiatorAddress = params.initiatorAddress.toLowerCase()
    return ethereumLog
  }
}
