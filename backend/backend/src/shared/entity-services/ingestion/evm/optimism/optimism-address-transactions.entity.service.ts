import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OptimismAddressTransaction } from './optimism-address-transaction.entity'
import { EvmAddressTransactionsEntityService } from '../evm-address-transactions.entity.service'

@Injectable()
export class OptimismAddressTransactionsEntityService extends EvmAddressTransactionsEntityService<OptimismAddressTransaction> {
  constructor(
    @InjectRepository(OptimismAddressTransaction)
    private optimismAddressTransactionRepository: Repository<OptimismAddressTransaction>
  ) {
    super(optimismAddressTransactionRepository)
  }
}
