import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { IntegrationSyncRequestsService } from './integration-sync-requests.service'

@ApiTags('integration-sync-requests')
@ApiBearerAuth()
@RequirePermissionResource(Resource.INTEGRATION_SYNC_REQUESTS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class IntegrationSyncRequestsController {
  constructor(private integrationSyncRequestService: IntegrationSyncRequestsService) {}

  @Get(':integrationName')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getLatestIntegrationSyncRequest(
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: IntegrationName
  ) {
    const [integrationSyncRequest] =
      await this.integrationSyncRequestService.getLatestIntegrationSyncRequestNameAndOrganizationId(
        integrationName,
        organizationId
      )
    //To check if the integration sync request exists
    if (!integrationSyncRequest) {
      throw new NotFoundException(`Can not find integration sync request`)
    }
    return integrationSyncRequest
  }
}
