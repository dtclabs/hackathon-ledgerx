import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { FinancialTransactionExportsDomainService } from './financial-transaction-exports.domain.service'
import { FinancialTransactionExportDto, CreateFinancialTransactionExportDto } from './interface'

@ApiTags('financial-transaction-exports')
@ApiBearerAuth()
@RequirePermissionResource(Resource.FINANCIAL_TRANSACTION_EXPORTS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class FinancialTransactionExportsController {
  constructor(private financialTransactionExportsDomainService: FinancialTransactionExportsDomainService) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: FinancialTransactionExportDto })
  async getAll(@OrganizationId() organizationId: string): Promise<FinancialTransactionExportDto[]> {
    return await this.financialTransactionExportsDomainService.getFinancialTransactionExportsForOrganization(
      organizationId
    )
  }

  @Post('')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: FinancialTransactionExportDto })
  async createFinancialTransactionExport(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() createFinancialTransactionExportDto: CreateFinancialTransactionExportDto
  ): Promise<FinancialTransactionExportDto> {
    return await this.financialTransactionExportsDomainService.createFinancialTransactionExport({
      organizationId,
      requestedBy: accountId,
      type: createFinancialTransactionExportDto.type,
      fileType: createFinancialTransactionExportDto.fileType,
      financialTransactionPublicIds: createFinancialTransactionExportDto.financialTransactionIds,
      query: createFinancialTransactionExportDto.query
    })
  }

  @Get(':id/download')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse()
  async downloadFinancialTransactionExport(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const { filename, mimeType, fileStream } =
      await this.financialTransactionExportsDomainService.getFinancialTransactionExportFile({
        organizationId,
        financialTransactionWorkflowPublicId: id
      })

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`
    })
    fileStream.pipe(res)

    return null
  }
}
