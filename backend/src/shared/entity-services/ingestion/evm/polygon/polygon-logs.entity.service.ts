import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PolygonLog } from './polygon-log.entity'
import { EvmLogsEntityService } from '../evm-logs.entity.service'

@Injectable()
export class PolygonLogsEntityService extends EvmLogsEntityService<PolygonLog> {
  constructor(
    @InjectRepository(PolygonLog)
    private polygonLogRepository: Repository<PolygonLog>
  ) {
    super(polygonLogRepository)
  }
}
