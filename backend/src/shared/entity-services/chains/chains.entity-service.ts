import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Chain } from './chain.entity'

@Injectable()
export class ChainsEntityService extends BaseEntityService<Chain> {
  constructor(
    @InjectRepository(Chain)
    private chainsRepository: Repository<Chain>
  ) {
    super(chainsRepository)
  }
}
