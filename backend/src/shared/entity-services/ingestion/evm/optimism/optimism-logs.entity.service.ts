import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OptimismLog } from './optimism-log.entity'
import { EvmLogsEntityService } from '../evm-logs.entity.service'

@Injectable()
export class OptimismLogsEntityService extends EvmLogsEntityService<OptimismLog> {
  constructor(
    @InjectRepository(OptimismLog)
    private optimismLogRepository: Repository<OptimismLog>
  ) {
    super(optimismLogRepository)
  }
}
