import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { OrganizationTrial, OrganizationTrialStatus } from './organization-trial.entity'

@Injectable()
export class OrganizationTrialsEntityService extends BaseEntityService<OrganizationTrial> {
  constructor(
    @InjectRepository(OrganizationTrial)
    private organizationTrialRepository: Repository<OrganizationTrial>
  ) {
    super(organizationTrialRepository)
  }

  createDefaultForNewOrganization(organizationId: string): Promise<OrganizationTrial> {
    const expiredAt = dateHelper.getUTCTimestampForward({ days: 30 })

    return this.organizationTrialRepository.save({
      organizationId,
      expiredAt,
      status: OrganizationTrialStatus.FREE_TRIAL
    })
  }

  getByOrganizationId(organizationId: string) {
    return this.organizationTrialRepository.findOne({
      where: {
        organizationId
      }
    })
  }
}
