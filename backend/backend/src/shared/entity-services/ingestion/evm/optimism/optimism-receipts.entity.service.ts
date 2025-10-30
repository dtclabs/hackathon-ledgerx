import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OptimismReceipt } from './optimism-receipt.entity'
import { EvmReceiptsEntityService } from '../evm-receipts.entity.service'

@Injectable()
export class OptimismReceiptsEntityService extends EvmReceiptsEntityService<OptimismReceipt> {
  constructor(
    @InjectRepository(OptimismReceipt)
    private optimismReceiptRepository: Repository<OptimismReceipt>
  ) {
    super(optimismReceiptRepository)
  }
}
