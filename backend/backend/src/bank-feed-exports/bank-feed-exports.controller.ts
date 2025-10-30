import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { BankFeedExportsDomainService } from './bank-feed-exports.domain.service'
import { BankFeedExportDto, CreateBankFeedExportDto } from './interface'

@ApiTags('bank-feed-exports')
@ApiBearerAuth()
@RequirePermissionResource(Resource.BANK_FEED_EXPORTS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class BankFeedExportsController {
  constructor(private bankFeedExportsDomainService: BankFeedExportsDomainService) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: BankFeedExportDto })
  async getAll(@OrganizationId() organizationId: string): Promise<BankFeedExportDto[]> {
    return await this.bankFeedExportsDomainService.getBankFeedExportsForOrganization(organizationId)
  }

  @Post('')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: BankFeedExportDto })
  async createBankFeedExport(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() createBankFeedExportDto: CreateBankFeedExportDto
  ): Promise<BankFeedExportDto[]> {
    return await this.bankFeedExportsDomainService.createBankFeedExports({
      organizationId,
      integrationName: createBankFeedExportDto.integrationName,
      requestedBy: accountId,
      fileType: createBankFeedExportDto.fileType,
      walletId: createBankFeedExportDto.walletId,
      cryptocurrencyIds: createBankFeedExportDto.cryptocurrencyIds,
      blockchainId: createBankFeedExportDto.blockchainId,
      startTime: createBankFeedExportDto.startTime,
      endTime: createBankFeedExportDto.endTime
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
    const { filename, mimeType, fileStream } = await this.bankFeedExportsDomainService.getBankFeedExportFile({
      organizationId,
      bankFeedWorkflowPublicId: id
    })

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`
    })
    fileStream.pipe(res)

    return null
  }
}
