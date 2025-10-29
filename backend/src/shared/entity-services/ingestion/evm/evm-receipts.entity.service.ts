import { DeepPartial, Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { EvmReceipt } from './evm-receipt.entity'
import { EvmTransactionEntitiesGetParams } from './interfaces'

export class EvmReceiptsEntityService<T extends EvmReceipt> extends BaseEntityService<EvmReceipt> {
  constructor(private evmReceiptRepository: Repository<EvmReceipt>) {
    super(evmReceiptRepository)
  }

  getByTransactionHashAndBlockchain(params: EvmTransactionEntitiesGetParams) {
    return this.evmReceiptRepository.findOne({
      where: {
        transactionHash: params.transactionHash,
        blockchainId: params.blockchainId
      }
    })
  }

  upsert(receipt: DeepPartial<T>) {
    return this.evmReceiptRepository.upsert(receipt, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['transactionHash', 'blockchainId']
    })
  }
}
