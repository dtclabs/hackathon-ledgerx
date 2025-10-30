import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GnosisTransactionDetail } from './gnosis-transaction-detail.entity'
import { EvmTransactionDetailsEntityService } from '../evm-transaction-details.entity.service'

@Injectable()
export class GnosisTransactionDetailsEntityService extends EvmTransactionDetailsEntityService<GnosisTransactionDetail> {
  constructor(
    @InjectRepository(GnosisTransactionDetail)
    private gnosisTransactionDetailRepository: Repository<GnosisTransactionDetail>
  ) {
    super(gnosisTransactionDetailRepository)
  }
}
