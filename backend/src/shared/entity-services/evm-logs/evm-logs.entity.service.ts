import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { EvmLog } from './evm-log.entity'

@Injectable()
export class EvmLogsEntityService extends BaseEntityService<EvmLog> {
  constructor(
    @InjectRepository(EvmLog)
    private evmLogRepository: Repository<EvmLog>
  ) {
    super(evmLogRepository)
  }

  async upsert(evmLog: EvmLog) {
    await this.evmLogRepository.upsert(evmLog, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['blockchainId', 'transactionHash', 'logIndex']
    })
    return this.evmLogRepository.findOne({
      where: {
        blockchainId: evmLog.blockchainId,
        transactionHash: evmLog.transactionHash,
        logIndex: evmLog.logIndex
      }
    })
  }
}
