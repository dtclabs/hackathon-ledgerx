import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action } from '../permissions/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction } from '../shared/decorators/permissions.decorator'
import { FeatureName } from '../shared/entity-services/feature-waitlist-requests/feature-waitlist-requests.entity'
import { FeatureWaitlistRequestsEntityService } from '../shared/entity-services/feature-waitlist-requests/feature-waitlist-requests.entity-service'
import { FeatureWaitlistRequestDto, GetFeatureWaitlistRequestQueryParams } from './interfaces'

@ApiTags('feature-waitlist-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FeatureWaitlistRequestsController {
  constructor(private featureWaitlistRequestsEntityService: FeatureWaitlistRequestsEntityService) {}

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiCreatedResponse({ type: FeatureWaitlistRequestDto })
  async createFeatureWaitlistRequest(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() dto: FeatureWaitlistRequestDto
  ): Promise<FeatureWaitlistRequestDto> {
    if (dto.featureName === FeatureName.NFT) {
      const exist = await this.featureWaitlistRequestsEntityService.getByOrganizationId(organizationId, [
        dto.featureName
      ])
      if (exist?.length) {
        throw new BadRequestException('This feature had already been requested before by this organization')
      }
      const featureWaitlistRequest = await this.featureWaitlistRequestsEntityService.createFeatureWaitlistRequest({
        requestedBy: accountId,
        contactEmail: dto.contactEmail,
        featureName: dto.featureName,
        organizationId: organizationId
      })

      return FeatureWaitlistRequestDto.map(featureWaitlistRequest)
    }
  }

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getFeatureWaitlistRequest(
    @OrganizationId() organizationId: string,
    @Query() query: GetFeatureWaitlistRequestQueryParams
  ) {
    const featureWaitlistRequests = await this.featureWaitlistRequestsEntityService.getByOrganizationId(
      organizationId,
      query.featureNames
    )

    return featureWaitlistRequests.map((fwr) => FeatureWaitlistRequestDto.map(fwr))
  }
}
