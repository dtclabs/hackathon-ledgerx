import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BscReceipt } from './bsc-receipt.entity'
import { EvmReceiptsEntityService } from '../evm-receipts.entity.service'

@Injectable()
export class BscReceiptsEntityService extends EvmReceiptsEntityService<BscReceipt> {
  constructor(
    @InjectRepository(BscReceipt)
    private bscReceiptRepository: Repository<BscReceipt>
  ) {
    super(bscReceiptRepository)
  }
}
