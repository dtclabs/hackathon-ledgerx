import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BscAddressTransaction } from './bsc-address-transaction.entity'
import { EvmAddressTransactionsEntityService } from '../evm-address-transactions.entity.service'

@Injectable()
export class BscAddressTransactionsEntityService extends EvmAddressTransactionsEntityService<BscAddressTransaction> {
  constructor(
    @InjectRepository(BscAddressTransaction)
    private bscAddressTransactionRepository: Repository<BscAddressTransaction>
  ) {
    super(bscAddressTransactionRepository)
  }
}
