import { Injectable } from '@nestjs/common'
import { IntegrationSyncRequestsEntityService } from '../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.service'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'

@Injectable()
export class IntegrationSyncRequestsService {
  constructor(private integrationSyncRequestsEntityService: IntegrationSyncRequestsEntityService) {}
  getLatestIntegrationSyncRequestNameAndOrganizationId(integrationName: IntegrationName, organizationId: string) {
    return this.integrationSyncRequestsEntityService.getLatestIntegrationSyncRequestNameAndOrganizationId(
      integrationName,
      organizationId
    )
  }
}
