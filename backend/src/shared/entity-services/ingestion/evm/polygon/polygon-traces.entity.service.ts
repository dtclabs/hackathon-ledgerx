import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PolygonTrace } from './polygon-trace.entity'
import { EvmTracesEntityService } from '../evm-traces.entity.service'

@Injectable()
export class PolygonTracesEntityService extends EvmTracesEntityService<PolygonTrace> {
  constructor(
    @InjectRepository(PolygonTrace)
    private polygonTraceRepository: Repository<PolygonTrace>
  ) {
    super(polygonTraceRepository)
  }
}
