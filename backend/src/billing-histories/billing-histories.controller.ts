import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PaginationResponse } from '../core/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { BillingHistoriesDomainService } from './billing-histories.domain.service'
import { BillingHistoriesQueryParams, BillingHistoryDto } from './interfaces'
import { Response } from 'express'

@ApiTags('billing-histories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BillingHistoriesController {
  constructor(private readonly billingHistoriesDomainService: BillingHistoriesDomainService) {}

  @Get()
  @ApiResponse({ status: 200, type: PaginationResponse })
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getAll(
    @OrganizationId() organizationId: string,
    @Query() query: BillingHistoriesQueryParams
  ): Promise<PaginationResponse<BillingHistoryDto>> {
    return await this.billingHistoriesDomainService.getAllPaging(organizationId, query)
  }

  @Get(':billingHistoryId/invoice')
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getInvoice(
    @Param('organizationId') organizationId: string,
    @Param('billingHistoryId') billingHistoryId: string,
    @Res() res: Response
  ) {
    const { filename, mimeType, fileStream } = await this.billingHistoriesDomainService.getInvoice(
      organizationId,
      billingHistoryId
    )

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`
    })
    fileStream.pipe(res)
  }
}
