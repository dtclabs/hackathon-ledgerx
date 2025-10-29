import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { IntegrationName } from '../integration/integration.entity'
import { IntegrationRetryRequest } from './integration-retry-request.entity'

@Injectable()
export class IntegrationRetryRequestEntityService extends BaseEntityService<IntegrationRetryRequest> {
  constructor(
    @InjectRepository(IntegrationRetryRequest)
    private integrationRetryRequestRepository: Repository<IntegrationRetryRequest>
  ) {
    super(integrationRetryRequestRepository)
  }

  async createByOrganizationAndIntegration(organizationId: string, integrationName: IntegrationName) {
    const integrationRetryRequestCreatePayload = this.integrationRetryRequestRepository.create({
      integration: { name: integrationName },
      organization: { id: organizationId }
    })
    return this.integrationRetryRequestRepository.save(integrationRetryRequestCreatePayload)
  }

  deleteByOrganizationAndIntegration(organizationId: string, integrationName: IntegrationName) {
    return this.integrationRetryRequestRepository.softDelete({
      integration: { name: integrationName },
      organization: { id: organizationId }
    })
  }

  async getOneByOrganizationAndIntegration(
    organizationId: string,
    integrationName: IntegrationName
  ): Promise<IntegrationRetryRequest> {
    const integrationRetryRequestResult = await this.integrationRetryRequestRepository.findOne({
      where: {
        integration: { name: integrationName },
        organization: { id: organizationId }
      }
    })
    return integrationRetryRequestResult
  }

  clearRetryCountAndRetryAt(integrationName: IntegrationName, organizationId: string) {
    const whereConditions: FindOptionsWhere<IntegrationRetryRequest> = {
      integration: { name: integrationName },
      organization: { id: organizationId }
    }
    return this.integrationRetryRequestRepository.update(whereConditions, {
      retryAt: null,
      retryCount: null
    })
  }
}
