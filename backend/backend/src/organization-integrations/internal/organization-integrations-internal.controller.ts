import { Controller, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { InternalAuthGuard } from '../../auth/internal-auth.guard'
import { AccountId } from '../../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../../shared/decorators/organization-id/organization-id.decorator'
import { IntegrationName } from '../../shared/entity-services/integration/integration.entity'
import { OrganizationIntegrationDisconnectType } from '../../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsDomainService } from '../../domain/organization-integrations/organization-integrations.domain.service'

@ApiTags('internal/organization-integrations')
@ApiBearerAuth()
@UseGuards(InternalAuthGuard)
@Controller()
export class OrganizationIntegrationsInternalController {
  constructor(private organizationIntegrationsDomainService: OrganizationIntegrationsDomainService) {}

  @Post(':integrationName/disconnect')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'string' })
  async disconnect(
    @AccountId() accountId: string,
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: IntegrationName
  ) {
    await this.organizationIntegrationsDomainService.disconnectIntegration(organizationId, integrationName, {
      disconnectType: OrganizationIntegrationDisconnectType.USER,
      disconnectDetails: { accountId }
    })
  }
}
