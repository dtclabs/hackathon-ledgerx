import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { ChartOfAccountMappingsDomainService } from './chart-of-account-mappings.domain.service'
import {
  ChartOfAccountMappingDto,
  ChartOfAccountMappingQueryParams,
  CreateChartOfAccountMappingDto,
  UpdateChartOfAccountMappingDto
} from './interfaces'
import { AccountingService } from '../domain/integrations/accounting/accounting.service'

@ApiTags('chart-of-account-mappings')
@ApiBearerAuth()
@RequirePermissionResource(Resource.CHART_OF_ACCOUNT_MAPPINGS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ChartOfAccountMappingsController {
  constructor(
    private chartOfAccountMappingsDomainService: ChartOfAccountMappingsDomainService,
    private accountingService: AccountingService
  ) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getAll(
    @OrganizationId() organizationId: string,
    @Query() query: ChartOfAccountMappingQueryParams
  ): Promise<ChartOfAccountMappingDto[]> {
    return await this.chartOfAccountMappingsDomainService.getChartOfAccountMappingsForOrganization({
      organizationId,
      type: query.type,
      walletPublicIds: query.walletIds,
      chartOfAccountPublicIds: query.chartOfAccountIds
    })
  }

  @Post('')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async createChartOfAccountMapping(
    @OrganizationId() organizationId: string,
    @Body() createChartOfAccountMappingDto: CreateChartOfAccountMappingDto
  ): Promise<ChartOfAccountMappingDto> {
    return await this.chartOfAccountMappingsDomainService.createWalletChartOfAccountMapping({
      organizationId,
      chartOfAccountPublicId: createChartOfAccountMappingDto.chartOfAccountId,
      type: createChartOfAccountMappingDto.type,
      walletPublicId: createChartOfAccountMappingDto.walletId,
      cryptocurrencyPublicId: createChartOfAccountMappingDto.cryptocurrencyId
    })
  }

  @Get(':id/count')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getChartOfAccountMappingCountThatWasOverriddenByUser(
    @OrganizationId() organizationId: string,
    @Param('id') id: string
  ) {
    return await this.chartOfAccountMappingsDomainService.getCOAMappingCountThatWasOverriddenByUserOnFinancialTransaction(
      {
        organizationId,
        chartOfAccountMappingPublicId: id
      }
    )
  }

  @Put(':id')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async updateChartOfAccountMapping(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body() updateChartOfAccountMappingDto: UpdateChartOfAccountMappingDto
  ): Promise<ChartOfAccountMappingDto> {
    return await this.chartOfAccountMappingsDomainService.updateChartOfAccountMapping({
      organizationId,
      chartOfAccountMappingPublicId: id,
      newChartOfAccountPublicId: updateChartOfAccountMappingDto.chartOfAccountId,
      toOverwriteManualData: updateChartOfAccountMappingDto.toOverwriteManualData
    })
  }

  @Delete(':id')
  @RequirePermissionAction(Action.DELETE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteChartOfAccountMapping(@OrganizationId() organizationId: string, @Param('id') id: string) {
    await this.chartOfAccountMappingsDomainService.deleteChartOfAccountMapping({
      organizationId,
      chartOfAccountMappingPublicId: id
    })
  }
}
