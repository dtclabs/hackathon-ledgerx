import { BadRequestException, Controller, Get, NotFoundException, Query, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger'
import { FeatureFlagDto } from './interfaces'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { FeatureFlagsEntityService } from '../shared/entity-services/feature-flags/feature-flags.entity-service'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { FeatureFlagOption } from '../shared/entity-services/feature-flags/interfaces'

@ApiTags('feature-flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FeatureFlagsController {
  constructor(
    private featureFlagsService: FeatureFlagsEntityService,
    private configService: ConfigService
  ) {}

  @Get()
  @ApiQuery({ name: 'name', type: 'string', required: true, example: 'financial_transaction' })
  @ApiOkResponse({ type: FeatureFlagDto })
  async getFeatureFlag(@OrganizationId() organizationId: string, @Query() query: { name: string }) {
    if (!query.name) {
      throw new BadRequestException('name is required')
    }
    
    // In development mode, allow any feature flag name and return enabled
    const isDevelopmentMode = this.configService.get('DEVELOPMENT_MODE') === 'true'
    if (isDevelopmentMode) {
      return {
        name: query.name,
        isEnabled: true
      }
    }
    
    // In production, validate against the enum
    if (!Object.values(FeatureFlagOption).includes(query.name as FeatureFlagOption)) {
      throw new BadRequestException('invalid feature_flag')
    }
    const result = {
      name: query.name,
      isEnabled: false
    }
    // check if feature is enabled for everyone
    const featureIsAvailableForAll = await this.featureFlagsService.isFeatureEnabled(query.name as FeatureFlagOption)
    if (featureIsAvailableForAll) {
      result.isEnabled = true
      return result
    }
    // otherwise check if feature enable for specific organizationId
    result.isEnabled = await this.featureFlagsService.isFeatureWhitelisted(organizationId, query.name as FeatureFlagOption)
    return result
  }
}
