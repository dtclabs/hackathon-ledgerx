import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PolygonReceipt } from './polygon-receipt.entity'
import { EvmReceiptsEntityService } from '../evm-receipts.entity.service'

@Injectable()
export class PolygonReceiptsEntityService extends EvmReceiptsEntityService<PolygonReceipt> {
  constructor(
    @InjectRepository(PolygonReceipt)
    private polygonReceiptRepository: Repository<PolygonReceipt>
  ) {
    super(polygonReceiptRepository)
  }
}
