import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmTracesEntityService } from '../evm-traces.entity.service'
import { GnosisTrace } from './gnosis-trace.entity'

@Injectable()
export class GnosisTracesEntityService extends EvmTracesEntityService<GnosisTrace> {
  constructor(
    @InjectRepository(GnosisTrace)
    private gnosisTraceRepository: Repository<GnosisTrace>
  ) {
    super(gnosisTraceRepository)
  }
}
