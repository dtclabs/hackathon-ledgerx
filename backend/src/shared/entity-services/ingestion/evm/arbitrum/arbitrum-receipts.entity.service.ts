import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmReceiptsEntityService } from '../evm-receipts.entity.service'
import { ArbitrumReceipt } from './arbitrum-receipt.entity'

@Injectable()
export class ArbitrumReceiptsEntityService extends EvmReceiptsEntityService<ArbitrumReceipt> {
  constructor(
    @InjectRepository(ArbitrumReceipt)
    private arbitrumReceiptRepository: Repository<ArbitrumReceipt>
  ) {
    super(arbitrumReceiptRepository)
  }
}
