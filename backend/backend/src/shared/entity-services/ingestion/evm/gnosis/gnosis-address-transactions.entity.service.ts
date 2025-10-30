import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GnosisAddressTransaction } from './gnosis-address-transaction.entity'
import { EvmAddressTransactionsEntityService } from '../evm-address-transactions.entity.service'

@Injectable()
export class GnosisAddressTransactionsEntityService extends EvmAddressTransactionsEntityService<GnosisAddressTransaction> {
  constructor(
    @InjectRepository(GnosisAddressTransaction)
    private gnosisAddressTransactionRepository: Repository<GnosisAddressTransaction>
  ) {
    super(gnosisAddressTransactionRepository)
  }
}
