import { Entity, Unique } from 'typeorm'
import { EvmBlockRewardCreateParams } from '../interfaces'
import { EvmBlockReward } from '../evm-block-reward.entity'

@Entity()
@Unique('UQ_polygon_block_reward_address_blockchain_block_index', ['validatedByAddress', 'blockchainId', 'blockNumber'])
export class PolygonBlockReward extends EvmBlockReward {
  static createBlockReward(params: EvmBlockRewardCreateParams): PolygonBlockReward {
    return EvmBlockReward.create<PolygonBlockReward>(PolygonBlockReward, params)
  }
}
