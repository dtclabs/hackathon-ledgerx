import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { ExportWorkflowsDomainService } from './export-workflows.domain.service'
import { CreateSpotBalanceExportWorkflowDto, ExportWorkflowDto, GetExportWorkflowsQueryParams } from './interface'

@ApiTags('export-workflows')
@ApiBearerAuth()
@RequirePermissionResource(Resource.EXPORT_WORKFLOWS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ExportWorkflowsController {
  constructor(private exportWorkflowsDomainService: ExportWorkflowsDomainService) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: ExportWorkflowDto })
  async getAll(
    @OrganizationId() organizationId: string,
    @Query() query: GetExportWorkflowsQueryParams
  ): Promise<ExportWorkflowDto[]> {
    return await this.exportWorkflowsDomainService.getForOrganization(organizationId, query)
  }

  @Post('spot-balance')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: ExportWorkflowDto })
  async createSpotBalanceExportWorkflow(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() createSpotBalanceExportWorkflowDto: CreateSpotBalanceExportWorkflowDto
  ): Promise<ExportWorkflowDto> {
    return await this.exportWorkflowsDomainService.createExportWorkflowForSpotBalance({
      organizationId,
      interval: createSpotBalanceExportWorkflowDto.interval,
      requestedBy: accountId,
      fileType: createSpotBalanceExportWorkflowDto.fileType,
      walletIds: createSpotBalanceExportWorkflowDto.walletIds,
      cryptocurrencyIds: createSpotBalanceExportWorkflowDto.cryptocurrencyIds,
      blockchainIds: createSpotBalanceExportWorkflowDto.blockchainIds,
      startDate: createSpotBalanceExportWorkflowDto.startDate,
      endDate: createSpotBalanceExportWorkflowDto.endDate
    })
  }

  @Get(':id/download')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse()
  async downloadBankFeedExport(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const { filename, mimeType, fileStream } = await this.exportWorkflowsDomainService.getExportFile({
      organizationId,
      exportWorkflowPublicId: id
    })

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`
    })
    fileStream.pipe(res)

    return null
  }
}
