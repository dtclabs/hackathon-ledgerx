import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { AssetBalanceQueryParams, BalanceDto } from './interfaces'
import { BalancesDomainService } from './balances.domain.service'
import { PortfolioService } from '../portfolio/portfolio.service'
import { PortfolioQueryParams, PortfolioOverviewDto } from '../portfolio/portfolio.interfaces'

@ApiTags('balance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@RequirePermissionResource(Resource.BALANCES)
@Controller()
export class BalancesController {
  constructor(
    private readonly balancesDomainService: BalancesDomainService,
    private readonly portfolioService: PortfolioService
  ) {}

  @Get()
  @ApiResponse({ status: 200, type: BalanceDto, isArray: true })
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getBalance(
    @OrganizationId() organizationId: string,
    @Query() query: AssetBalanceQueryParams
  ): Promise<BalanceDto> {
    return await this.balancesDomainService.getBalanceByOrganization(organizationId, query)
  }

  @Get('overview')
  @ApiResponse({ 
    status: 200, 
    type: PortfolioOverviewDto,
    description: 'Get comprehensive portfolio overview with token breakdown, similar to the UI dashboard'
  })
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getPortfolioOverview(
    @OrganizationId() organizationId: string,
    @Query() query: PortfolioQueryParams
  ): Promise<PortfolioOverviewDto> {
    return await this.portfolioService.getPortfolioOverview(organizationId, query)
  }

  @Get('tokens')
  @ApiResponse({ 
    status: 200,
    description: 'Get token-level balance breakdown showing individual token holdings instead of blockchain groups',
    schema: {
      example: {
        data: {
          value: "2456789.50",
          fiatCurrency: "USD",
          groups: {
            "sol": { "value": "1000000.00", "fiatCurrency": "USD" },
            "bonk": { "value": "750000.00", "fiatCurrency": "USD" },
            "wif": { "value": "400000.00", "fiatCurrency": "USD" },
            "trump": { "value": "200000.00", "fiatCurrency": "USD" },
            "usdc": { "value": "106789.50", "fiatCurrency": "USD" }
          }
        }
      }
    }
  })
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getTokenLevelBalance(
    @OrganizationId() organizationId: string,
    @Query() query: AssetBalanceQueryParams
  ) {
    return await this.balancesDomainService.getTokenLevelBalance(organizationId, query)
  }
}
