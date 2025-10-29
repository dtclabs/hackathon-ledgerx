import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmLogsEntityService } from '../evm-logs.entity.service'
import { ArbitrumLog } from './arbitrum-log.entity'

@Injectable()
export class ArbitrumLogsEntityService extends EvmLogsEntityService<ArbitrumLog> {
  constructor(
    @InjectRepository(ArbitrumLog)
    private arbitrumLogRepository: Repository<ArbitrumLog>
  ) {
    super(arbitrumLogRepository)
  }
}
