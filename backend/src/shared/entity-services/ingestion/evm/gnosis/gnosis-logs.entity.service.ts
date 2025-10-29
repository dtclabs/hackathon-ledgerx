import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GnosisLog } from './gnosis-log.entity'
import { EvmLogsEntityService } from '../evm-logs.entity.service'

@Injectable()
export class GnosisLogsEntityService extends EvmLogsEntityService<GnosisLog> {
  constructor(
    @InjectRepository(GnosisLog)
    private gnosisLogRepository: Repository<GnosisLog>
  ) {
    super(gnosisLogRepository)
  }
}
