import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmTransactionDetailsEntityService } from '../evm-transaction-details.entity.service'
import { ArbitrumTransactionDetail } from './arbitrum-transaction-detail.entity'

@Injectable()
export class ArbitrumTransactionDetailsEntityService extends EvmTransactionDetailsEntityService<ArbitrumTransactionDetail> {
  constructor(
    @InjectRepository(ArbitrumTransactionDetail)
    private arbitrumTransactionDetailRepository: Repository<ArbitrumTransactionDetail>
  ) {
    super(arbitrumTransactionDetailRepository)
  }
}
