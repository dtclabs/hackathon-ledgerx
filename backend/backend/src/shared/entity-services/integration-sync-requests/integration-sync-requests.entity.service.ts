import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { IntegrationName } from '../integration/integration.entity'
import { IntegrationSyncRequest, IntegrationSyncRequestStatus } from './integration-sync-request.entity'

@Injectable()
export class IntegrationSyncRequestsEntityService extends BaseEntityService<IntegrationSyncRequest> {
  constructor(
    @InjectRepository(IntegrationSyncRequest)
    private integrationSyncRequestRepository: Repository<IntegrationSyncRequest>
  ) {
    super(integrationSyncRequestRepository)
  }

  async deleteIntegrationSyncRequest(where: FindOptionsWhere<IntegrationSyncRequest>): Promise<boolean> {
    const result = await this.integrationSyncRequestRepository.softDelete(where)
    return !!result.affected
  }

  getLatestIntegrationSyncRequestNameAndOrganizationId(
    integrationName: IntegrationName,
    organizationId: string
  ): Promise<IntegrationSyncRequest[]> {
    return this.integrationSyncRequestRepository.find({
      where: {
        integration: { name: integrationName },
        organization: { id: organizationId },
        status: IntegrationSyncRequestStatus.SYNCED
      },
      relations: { integration: true, organization: true },
      order: { createdAt: 'DESC' }
    })
  }
}
