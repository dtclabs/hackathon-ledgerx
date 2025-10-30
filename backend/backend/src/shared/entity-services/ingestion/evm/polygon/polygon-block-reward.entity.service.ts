import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmBlockRewardEntityService } from '../evm-block-reward.entity.service'
import { PolygonBlockReward } from './polygon-block-reward.entity'

@Injectable()
export class PolygonBlockRewardEntityService extends EvmBlockRewardEntityService<PolygonBlockReward> {
  constructor(
    @InjectRepository(PolygonBlockReward)
    private polygonBlockRewardRepository: Repository<PolygonBlockReward>
  ) {
    super(polygonBlockRewardRepository)
  }
}
