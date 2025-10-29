import { DeepPartial, Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { EvmLog } from './evm-log.entity'
import { EvmGetContractAddressesFromLogsParams, EvmTransactionEntitiesGetParams } from './interfaces'

export class EvmLogsEntityService<T extends EvmLog> extends BaseEntityService<EvmLog> {
  constructor(private evmLogRepository: Repository<EvmLog>) {
    super(evmLogRepository)
  }

  getByHash(params: EvmTransactionEntitiesGetParams) {
    return this.evmLogRepository.find({
      where: {
        transactionHash: params.transactionHash,
        blockchainId: params.blockchainId
      },
      order: {
        logIndex: 'ASC'
      }
    })
  }

  async upsert(evmLog: DeepPartial<T>) {
    return this.evmLogRepository.upsert(evmLog, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['blockchainId', 'transactionHash', 'logIndex']
    })
  }

  async getContractAddresses(params: EvmGetContractAddressesFromLogsParams): Promise<string[]> {
    const result = await this.evmLogRepository
      .createQueryBuilder('logs')
      .select('logs.contract_address')
      .distinctOn(['logs.contract_address'])
      .where('logs.transaction_hash in (:...hashes)', { hashes: params.transactionHashes })
      .andWhere('(from_address = :address or to_address=:address)', { address: params.address })
      .andWhere('logs.blockchain_id = :blockchain_id', { blockchain_id: params.blockchainId })
      .getRawMany()
    return result.map((r) => r.contract_address)
  }
}
