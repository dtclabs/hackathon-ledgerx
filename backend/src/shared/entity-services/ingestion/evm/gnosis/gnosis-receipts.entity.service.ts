import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GnosisReceipt } from './gnosis-receipt.entity'
import { EvmReceiptsEntityService } from '../evm-receipts.entity.service'

@Injectable()
export class GnosisReceiptsEntityService extends EvmReceiptsEntityService<GnosisReceipt> {
  constructor(
    @InjectRepository(GnosisReceipt)
    private gnosisReceiptRepository: Repository<GnosisReceipt>
  ) {
    super(gnosisReceiptRepository)
  }
}
