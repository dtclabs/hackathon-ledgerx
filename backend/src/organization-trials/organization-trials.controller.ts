import { Controller, Get, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { OrganizationTrialsEntityService } from '../shared/entity-services/organization-trials/organization-trials.entity-service'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { OrganizationTrialDto } from './interfaces'

@ApiTags('organization-trials')
@ApiBearerAuth()
@RequirePermissionResource(Resource.SETTINGS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class OrganizationTrialsController {
  constructor(
    private organizationTrialsEntityService: OrganizationTrialsEntityService,
    private configService: ConfigService
  ) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: OrganizationTrialDto, isArray: true })
  async getOrganizationTrial(@OrganizationId() organizationId: string) {
    // Return empty array in development mode to disable trials
    if (this.configService.get('DEVELOPMENT_MODE') === 'true' || this.configService.get('DISABLE_TRIALS') === 'true') {
      return []
    }

    const organizationTrial = await this.organizationTrialsEntityService.getByOrganizationId(organizationId)
    return [OrganizationTrialDto.map(organizationTrial)]
  }
}
