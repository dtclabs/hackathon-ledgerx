import { Column, DeepPartial } from 'typeorm'
import { hexToNumber } from 'web3-utils'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { EvmLogCreateParams } from './interfaces'

export abstract class EvmLog extends BaseEntity {
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

  @Column({ name: 'from_address', nullable: true })
  fromAddress: string

  @Column({ name: 'to_address', nullable: true })
  toAddress: string

  static create<T extends EvmLog>(params: EvmLogCreateParams): DeepPartial<T> {
    return {
      contractAddress: params.contractAddress.toLowerCase(),
      blockHash: params.blockHash.toLowerCase(),
      blockNumber: hexToNumber(params.blockNumber),
      blockTimestamp: params.blockTimestamp,
      blockchainId: params.blockchainId,
      transactionHash: params.transactionHash.toLowerCase(),
      logIndex: hexToNumber(params.logIndex),
      topic0: params.topic0,
      topic1: params.topic1,
      topic2: params.topic2,
      topic3: params.topic3,
      data: params.data,
      initiatorAddress: params.initiatorAddress.toLowerCase(),
      fromAddress: params.fromAddress?.toLowerCase() ?? null,
      toAddress: params.toAddress?.toLowerCase() ?? null
    } as DeepPartial<T>
  }
}
