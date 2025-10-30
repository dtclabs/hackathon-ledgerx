import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { IntegrationWhitelistRequest } from './integration-whitelist-requests.entity'

@Injectable()
export class IntegrationWhitelistRequestEntityService extends BaseEntityService<IntegrationWhitelistRequest> {
  constructor(
    @InjectRepository(IntegrationWhitelistRequest)
    private integrationWhitelistRequestRepository: Repository<IntegrationWhitelistRequest>
  ) {
    super(integrationWhitelistRequestRepository)
  }

  getIntegrationNameAndOrganizationId(
    integrationName: string,
    organizationId: string,
    status?: string
  ): Promise<IntegrationWhitelistRequest> {
    let condition = {}
    if (status) {
      condition = {
        status: status,
        integrationName: { name: integrationName },
        organizationId: { id: organizationId }
      }
    }
    condition = {
      integrationName: { name: integrationName },
      organizationId: { id: organizationId }
    }
    return this.integrationWhitelistRequestRepository.findOne({
      where: condition,
      relations: { integrationName: true, organizationId: true }
    })
  }
}
