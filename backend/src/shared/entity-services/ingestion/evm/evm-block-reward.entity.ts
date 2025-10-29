import { Column } from 'typeorm'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { EvmBlockRewardCreateParams } from './interfaces'

export abstract class EvmBlockReward extends BaseEntity {
  @Column({ name: 'validated_by_address' })
  validatedByAddress: string

  @Column({ name: 'block_number' })
  blockNumber: number

  @Column({ name: 'block_timestamp' })
  blockTimestamp: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'block_reward' })
  blockReward: string

  static create<T extends EvmBlockReward>(type: { new (): T }, params: EvmBlockRewardCreateParams): T {
    const evmLog = new type()
    evmLog.validatedByAddress = params.validatedByAddress.toLowerCase()
    evmLog.blockNumber = params.blockNumber
    evmLog.blockTimestamp = params.blockTimestamp
    evmLog.blockchainId = params.blockchainId
    evmLog.blockReward = params.blockReward
    return evmLog
  }
}
