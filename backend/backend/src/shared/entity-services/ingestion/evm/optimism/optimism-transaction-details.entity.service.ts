import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OptimismTransactionDetail } from './optimism-transaction-detail.entity'
import { EvmTransactionDetailsEntityService } from '../evm-transaction-details.entity.service'

@Injectable()
export class OptimismTransactionDetailsEntityService extends EvmTransactionDetailsEntityService<OptimismTransactionDetail> {
  constructor(
    @InjectRepository(OptimismTransactionDetail)
    private optimismTransactionDetailRepository: Repository<OptimismTransactionDetail>
  ) {
    super(optimismTransactionDetailRepository)
  }
}
