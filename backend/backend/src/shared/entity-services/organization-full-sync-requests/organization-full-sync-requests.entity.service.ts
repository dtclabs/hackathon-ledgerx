import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { OrganizationFullSyncRequest } from './organization-full-sync-request.entity'
import { dateHelper } from '../../helpers/date.helper'

@Injectable()
export class OrganizationFullSyncRequestsEntityService extends BaseEntityService<OrganizationFullSyncRequest> {
  constructor(
    @InjectRepository(OrganizationFullSyncRequest)
    private organizationFullSyncRequestRepository: Repository<OrganizationFullSyncRequest>
  ) {
    super(organizationFullSyncRequestRepository)
  }

  markAsExecuted(id: string) {
    return this.organizationFullSyncRequestRepository.update(id, {
      executedAt: dateHelper.getUTCTimestamp()
    })
  }

  async getNonExecuted() {
    return this.organizationFullSyncRequestRepository.find({
      where: {
        executedAt: IsNull()
      },
      order: {
        forceRun: 'DESC'
      }
    })
  }
}
