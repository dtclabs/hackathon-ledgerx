import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PolygonAddressTransaction } from './polygon-address-transaction.entity'
import { EvmAddressTransactionsEntityService } from '../evm-address-transactions.entity.service'

@Injectable()
export class PolygonAddressTransactionsEntityService extends EvmAddressTransactionsEntityService<PolygonAddressTransaction> {
  constructor(
    @InjectRepository(PolygonAddressTransaction)
    private polygonAddressTransactionEntityRepository: Repository<PolygonAddressTransaction>
  ) {
    super(polygonAddressTransactionEntityRepository)
  }
}
