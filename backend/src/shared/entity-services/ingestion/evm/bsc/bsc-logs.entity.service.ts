import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BscLog } from './bsc-log.entity'
import { EvmLogsEntityService } from '../evm-logs.entity.service'

@Injectable()
export class BscLogsEntityService extends EvmLogsEntityService<BscLog> {
  constructor(
    @InjectRepository(BscLog)
    private polygonLogRepository: Repository<BscLog>
  ) {
    super(polygonLogRepository)
  }
}
