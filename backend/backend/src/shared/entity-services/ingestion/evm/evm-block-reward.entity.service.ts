import { MoreThan, Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { EvmBlockReward } from './evm-block-reward.entity'
import { EvmGetBlockRewardParams, EvmTransactionEntitiesGetByBatchesParams } from './interfaces'

export class EvmBlockRewardEntityService<T extends EvmBlockReward> extends BaseEntityService<EvmBlockReward> {
  constructor(private evmBlockRewardRepository: Repository<EvmBlockReward>) {
    super(evmBlockRewardRepository)
  }

  async getLatestBlockNumber(param: EvmGetBlockRewardParams) {
    const evmBlockReward = await this.evmBlockRewardRepository.findOne({
      where: {
        blockchainId: param.blockchainId,
        validatedByAddress: param.validatedByAddress
      },
      order: {
        blockNumber: 'DESC'
      }
    })

    return evmBlockReward?.blockNumber ?? null
  }

  upsert(polygonBlockReward: T) {
    return this.evmBlockRewardRepository.upsert(polygonBlockReward, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['validatedByAddress', 'blockchainId', 'blockNumber']
    })
  }

  getByBatches(params: EvmTransactionEntitiesGetByBatchesParams) {
    return this.evmBlockRewardRepository.find({
      where: {
        blockchainId: params.blockchainId,
        validatedByAddress: params.address,
        blockNumber: MoreThan(params.startingBlockNumber ?? 0)
      },
      take: params.limit,
      skip: params.skip
    })
  }
}
