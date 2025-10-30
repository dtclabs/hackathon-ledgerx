import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { GnosisCustomLog } from './gnosis-custom-log.entity'
import { BaseEntityService } from '../../../base.entity-service'

@Injectable()
export class GnosisCustomLogsEntityService extends BaseEntityService<GnosisCustomLog> {
  constructor(
    @InjectRepository(GnosisCustomLog)
    private gnosisCustomLogEntityRepository: Repository<GnosisCustomLog>
  ) {
    super(gnosisCustomLogEntityRepository)
  }

  upsert(log: DeepPartial<GnosisCustomLog>) {
    return this.gnosisCustomLogEntityRepository.upsert(log, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['transactionHash', 'logIndex']
    })
  }

  getByTransactionHash(transactionHash: string) {
    return this.gnosisCustomLogEntityRepository.find({ where: { transactionHash } })
  }
}
