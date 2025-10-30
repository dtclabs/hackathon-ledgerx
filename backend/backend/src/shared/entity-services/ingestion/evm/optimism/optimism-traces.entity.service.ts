import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmTracesEntityService } from '../evm-traces.entity.service'
import { OptimismTrace } from './optimism-trace.entity'

@Injectable()
export class OptimismTracesEntityService extends EvmTracesEntityService<OptimismTrace> {
  constructor(
    @InjectRepository(OptimismTrace)
    private optimismTraceRepository: Repository<OptimismTrace>
  ) {
    super(optimismTraceRepository)
  }
}
