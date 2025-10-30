import { DeepPartial, Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { EvmTrace } from './evm-trace.entity'
import { EvmTransactionEntitiesGetParams } from './interfaces'

export class EvmTracesEntityService<T extends EvmTrace> extends BaseEntityService<EvmTrace> {
  constructor(private evmTraceRepository: Repository<EvmTrace>) {
    super(evmTraceRepository)
  }

  countByHash(params: EvmTransactionEntitiesGetParams): Promise<number> {
    return this.evmTraceRepository.count({
      where: {
        transactionHash: params.transactionHash,
        blockchainId: params.blockchainId
      }
    })
  }

  getByHash(params: EvmTransactionEntitiesGetParams) {
    return this.evmTraceRepository.find({
      where: {
        transactionHash: params.transactionHash,
        blockchainId: params.blockchainId,
        isError: false
      },
      order: {
        traceIndex: 'ASC'
      }
    })
  }

  upsert(trace: DeepPartial<T>) {
    return this.evmTraceRepository.upsert(trace, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['transactionHash', 'blockchainId', 'traceIndex']
    })
  }
}
