import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PolygonTransactionDetail } from './polygon-transaction-detail.entity'
import { EvmTransactionDetailsEntityService } from '../evm-transaction-details.entity.service'

@Injectable()
export class PolygonTransactionDetailsEntityService extends EvmTransactionDetailsEntityService<PolygonTransactionDetail> {
  constructor(
    @InjectRepository(PolygonTransactionDetail)
    private polygonTransactionDetailRepository: Repository<PolygonTransactionDetail>
  ) {
    super(polygonTransactionDetailRepository)
  }
}
