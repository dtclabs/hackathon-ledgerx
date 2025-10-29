import { DeepPartial, IsNull, Repository } from 'typeorm'
import { EvmAddressTransaction } from './evm-address-transaction.entity'
import { BaseEntityService } from '../../base.entity-service'
import { RawTransactionTaskStatusEnum } from '../../raw-transactions/interfaces'
import {
  EvmAddressTransactionGetByBatchParams,
  EvmGetTransactionHashesResult,
  EvmTransactionEntitiesGetByBatchesParams
} from './interfaces'

export class EvmAddressTransactionsEntityService<
  T extends EvmAddressTransaction
> extends BaseEntityService<EvmAddressTransaction> {
  constructor(private evmAddressTransactionEntityRepository: Repository<EvmAddressTransaction>) {
    super(evmAddressTransactionEntityRepository)
  }

  async getLatestBlock(params: { address: string; blockchainId; contractConfigurationId: string }) {
    const entity = await this.findOne({
      where: {
        address: params.address,
        blockchainId: params.blockchainId,
        contractConfigurationId: params.contractConfigurationId ? params.contractConfigurationId : IsNull(),
        status: RawTransactionTaskStatusEnum.COMPLETED
      },
      order: {
        blockNumber: 'DESC'
      }
    })
    return entity?.blockNumber ?? null
  }

  async getLatestBlockNumberFromAll(params: { address: string; blockchainId; contractConfigurationId: string }) {
    const entity = await this.findOne({
      where: {
        address: params.address,
        blockchainId: params.blockchainId,
        contractConfigurationId: params.contractConfigurationId ? params.contractConfigurationId : IsNull()
      },
      order: {
        blockNumber: 'DESC'
      }
    })
    return entity?.blockNumber ?? null
  }

  async upsert(addressTransaction: DeepPartial<T>) {
    const existing = await this.evmAddressTransactionEntityRepository.findOne({
      where: {
        hash: addressTransaction.hash,
        address: addressTransaction.address,
        blockchainId: addressTransaction.blockchainId,
        contractConfigurationId: addressTransaction.contractConfigurationId ?? IsNull()
      }
    })
    if (existing) {
      return
    }
    await this.evmAddressTransactionEntityRepository.save(addressTransaction)
  }

  findRunningByParams(params: EvmAddressTransactionGetByBatchParams) {
    return this.evmAddressTransactionEntityRepository.find({
      where: {
        address: params.address,
        contractConfigurationId: params.contractConfigurationId ? params.contractConfigurationId : IsNull(),
        blockchainId: params.blockchainId,
        status: RawTransactionTaskStatusEnum.RUNNING
      },
      order: {
        blockNumber: 'ASC'
      },
      take: params.pageSize
    })
  }

  complete(id: string) {
    return this.evmAddressTransactionEntityRepository.update(id, {
      status: RawTransactionTaskStatusEnum.COMPLETED
    })
  }

  getHashesByBatches(params: EvmTransactionEntitiesGetByBatchesParams) {
    const query = this.evmAddressTransactionEntityRepository
      .createQueryBuilder('address_transaction')
      .select('address_transaction.block_number', 'blockNumber')
      .addSelect('address_transaction.hash', 'transactionHash')
      .where('address_transaction.address = :address', { address: params.address })
      .andWhere('address_transaction.blockchain_id = :blockchainId', { blockchainId: params.blockchainId })
      .andWhere('address_transaction.deleted_at IS NULL')
      .andWhere('address_transaction.status = :status', { status: RawTransactionTaskStatusEnum.COMPLETED })

    if (params.startingBlockNumber) {
      query.andWhere('address_transaction.block_number > :startingBlockNumber', {
        startingBlockNumber: params.startingBlockNumber
      })
    }

    query
      .orderBy('address_transaction.block_number', 'ASC')
      .groupBy('address_transaction.block_number')
      .addGroupBy('address_transaction.hash')
      .take(params.limit)
      .offset(params.skip)

    return query.getRawMany<EvmGetTransactionHashesResult>()
  }
}
