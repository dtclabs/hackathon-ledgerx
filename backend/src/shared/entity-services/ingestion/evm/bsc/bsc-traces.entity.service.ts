import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmTracesEntityService } from '../evm-traces.entity.service'
import { BscTrace } from './bsc-trace.entity'

@Injectable()
export class BscTracesEntityService extends EvmTracesEntityService<BscTrace> {
  constructor(
    @InjectRepository(BscTrace)
    private polygonTraceRepository: Repository<BscTrace>
  ) {
    super(polygonTraceRepository)
  }
}
