import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BscTransactionDetail } from './bsc-transaction-detail.entity'
import { EvmTransactionDetailsEntityService } from '../evm-transaction-details.entity.service'

@Injectable()
export class BscTransactionDetailsEntityService extends EvmTransactionDetailsEntityService<BscTransactionDetail> {
  constructor(
    @InjectRepository(BscTransactionDetail)
    private bscTransactionDetailRepository: Repository<BscTransactionDetail>
  ) {
    super(bscTransactionDetailRepository)
  }
}
