import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmAddressTransactionsEntityService } from '../evm-address-transactions.entity.service'
import { ArbitrumAddressTransaction } from './arbitrum-address-transaction.entity'

@Injectable()
export class ArbitrumAddressTransactionsEntityService extends EvmAddressTransactionsEntityService<ArbitrumAddressTransaction> {
  constructor(
    @InjectRepository(ArbitrumAddressTransaction)
    private arbitrumAddressTransactionRepository: Repository<ArbitrumAddressTransaction>
  ) {
    super(arbitrumAddressTransactionRepository)
  }
}
