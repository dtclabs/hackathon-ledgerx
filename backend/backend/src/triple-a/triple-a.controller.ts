import { UseGuards, Controller, Get, Query, ForbiddenException, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { TripleAService } from '../domain/integrations/triple-a/triple-a.service'
import { BankDto, BanksQuery, RequiredFieldsDto, RequiredFieldsQuery } from './interfaces'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { SubscriptionsDomainService } from '../domain/subscriptions/subscriptions.domain.service'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'

@ApiTags('triple-a')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SubscriptionPlanPermissionGuard)
@RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.INTEGRATIONS)
@Controller()
export class TripleAController {
  constructor(
    private readonly tripleAService: TripleAService,
    private subscriptionsDomainService: SubscriptionsDomainService
  ) {}

  @Get('/banks')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, isArray: true, type: BankDto })
  async findBanks(@OrganizationId() organizationId: string, @Query() query: BanksQuery): Promise<BankDto[]> {
    const hasIntegration = await this.subscriptionsDomainService.hasIntegration(
      organizationId,
      IntegrationName.TRIPLE_A
    )
    if (!hasIntegration) {
      throw new ForbiddenException()
    }

    const response = await this.tripleAService.listBanks(query)

    return response.map((element) => BankDto.map(element))
  }

  @Get('/required-fields')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: RequiredFieldsDto })
  async getRequiredFields(@OrganizationId() organizationId: string, @Query() query: RequiredFieldsQuery) {
    const hasIntegration = await this.subscriptionsDomainService.hasIntegration(
      organizationId,
      IntegrationName.TRIPLE_A
    )
    if (!hasIntegration) {
      throw new ForbiddenException()
    }

    const response = await this.tripleAService.listRequiredFields(query.countryCode)

    if (!response[query.countryCode]) throw new BadRequestException(`Country not supported: ${query.countryCode}`)

    return RequiredFieldsDto.map(response[query.countryCode].bank_account)
  }
}
