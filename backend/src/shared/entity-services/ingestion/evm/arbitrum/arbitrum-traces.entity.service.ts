import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EvmTracesEntityService } from '../evm-traces.entity.service'
import { ArbitrumTrace } from './arbitrum-trace.entity'

@Injectable()
export class ArbitrumTracesEntityService extends EvmTracesEntityService<ArbitrumTrace> {
  constructor(
    @InjectRepository(ArbitrumTrace)
    private arbitrumTraceRepository: Repository<ArbitrumTrace>
  ) {
    super(arbitrumTraceRepository)
  }
}
