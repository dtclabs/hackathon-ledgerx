import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { In } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { PostgresErrorCode } from '../shared/constants/'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { IntegrationWhitelistRequestStatus } from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-requests.entity'
import { IntegrationWhitelistRequestEntityService } from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-requests.entity-service'
import { IntegrationStatus } from '../shared/entity-services/integration/integration.entity'
import { IntegrationEntityService } from '../shared/entity-services/integration/integration.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { IntegrationWhitelistDTO } from './interfaces'
import { FeatureFlagsEntityService } from '../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../shared/entity-services/feature-flags/interfaces'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { SubscriptionsDomainService } from '../domain/subscriptions/subscriptions.domain.service'

@ApiTags('integration-whitelist-requests')
@ApiBearerAuth()
@RequirePermissionResource(Resource.INTEGRATION_WHITELIST_REQUESTS)
@RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.INTEGRATIONS)
@UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
@Controller()
export class IntegrationWhitelistRequestsController {
  constructor(
    private integrationWhiteListEntityService: IntegrationWhitelistRequestEntityService,
    private integrationEntityService: IntegrationEntityService,
    private organizationsEntityService: OrganizationsEntityService,
    private subscriptionsDomainService: SubscriptionsDomainService,
    private featureFlagsEntityService: FeatureFlagsEntityService
  ) {}

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Success' })
  async integrationWhitelist(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() integrationWhitelist: IntegrationWhitelistDTO
  ) {
    if (await this.featureFlagsEntityService.isFeatureEnabled(FeatureFlagOption.SUBSCRIPTION_PLAN_PERMISSION)) {
      const hasIntegration = await this.subscriptionsDomainService.hasIntegration(
        organizationId,
        integrationWhitelist.integrationName
      )
      if (!hasIntegration) {
        throw new ForbiddenException()
      }
    }

    const integrationResult = await this.integrationEntityService.findOne({
      where: { name: integrationWhitelist.integrationName, status: IntegrationStatus.ENABLED }
    })
    //To check if the integration exists
    if (!integrationResult) {
      throw new NotFoundException(`Integration does not exist`)
    }
    const integrationWhitelistRequestResult = await this.integrationWhiteListEntityService.findOne({
      where: {
        integrationName: { name: integrationResult.name },
        organizationId: { id: organizationId },
        status: In([IntegrationWhitelistRequestStatus.REQUESTED, IntegrationWhitelistRequestStatus.APPROVED])
      }
    })
    if (integrationWhitelistRequestResult) {
      throw new ConflictException()
    }
    try {
      const organizationResult = await this.organizationsEntityService.findOne({ where: { id: organizationId } })
      const result = await this.integrationWhiteListEntityService.create({
        requestedBy: accountId,
        status: IntegrationWhitelistRequestStatus.REQUESTED,
        integrationName: { name: integrationWhitelist.integrationName },
        contactEmail: integrationWhitelist.contactEmail,
        organizationId: { id: organizationResult.id }
      })

      return IntegrationWhitelistDTO.map(result)
    } catch (error) {
      if (
        error?.code === PostgresErrorCode.UniqueViolation ||
        error?.data?.code === PostgresErrorCode.UniqueViolation
      ) {
        throw new BadRequestException('IntegrationWhitelist was requested before')
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':integrationName')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getIntegrationWhitelistByName(
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: string
  ) {
    const integrationWhitelistRequest =
      await this.integrationWhiteListEntityService.getIntegrationNameAndOrganizationId(integrationName, organizationId)
    //To check if the integration whitelist request exists
    if (!integrationWhitelistRequest) {
      throw new NotFoundException(`Can not find integration whitelist request`)
    }
    return IntegrationWhitelistDTO.map(integrationWhitelistRequest)
  }
}
