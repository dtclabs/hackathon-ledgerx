import { DeepPartial, Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { EvmTransactionDetail } from './evm-transaction-detail.entity'

export class EvmTransactionDetailsEntityService<
  T extends EvmTransactionDetail
> extends BaseEntityService<EvmTransactionDetail> {
  constructor(private evmTransactionDetailRepository: Repository<EvmTransactionDetail>) {
    super(evmTransactionDetailRepository)
  }

  async upsert(evmTransactionDetail: DeepPartial<T>) {
    return this.evmTransactionDetailRepository.upsert(evmTransactionDetail, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['hash', 'blockchainId']
    })
  }
}
