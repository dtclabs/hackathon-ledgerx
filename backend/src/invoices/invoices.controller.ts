import { BadRequestException, Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { InvoicesDomainService } from '../domain/invoices/invoices.domain.service'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { CreateInvoiceDto, GenerateQrDto, InvoiceDto, InvoicePublicDto, InvoicesQueryParams } from './interfaces'
import { NoAuth } from '../shared/decorators/no-auth.decorator'
import { InvoiceSource, InvoiceStatus } from '../shared/entity-services/invoices/interfaces'
import { PaginationResponse } from '../core/interfaces'
import { dateHelper } from '../shared/helpers/date.helper'
import { Response } from 'express'

@ApiTags('invoices')
@ApiBearerAuth()
@RequirePermissionResource(Resource.INVOICES)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class InvoicesController {
  constructor(private invoicesDomainService: InvoicesDomainService) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: InvoiceDto, isArray: true })
  async getAll(
    @OrganizationId() organizationId: string,
    @Query() invoicesQueryParams: InvoicesQueryParams
  ): Promise<PaginationResponse<InvoiceDto>> {
    // Hardcode to show only dtcpay invoices
    invoicesQueryParams.source = InvoiceSource.DTCPAY
    return await this.invoicesDomainService.getAllPaging(organizationId, invoicesQueryParams)
  }

  @Get(':id')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: InvoiceDto })
  async get(@OrganizationId() organizationId: string, @Param('id') publicId: string) {
    const invoice = await this.invoicesDomainService.refreshFromSource(organizationId, publicId)
    return InvoiceDto.map(invoice)
  }

  @Get(':id/public')
  @NoAuth()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: InvoiceDto })
  async getPublic(@OrganizationId() organizationId: string, @Param('id') publicId: string) {
    const invoice = await this.invoicesDomainService.refreshFromSource(organizationId, publicId)
    // Do not display invoice past invoice.expiredAt
    if (
      [InvoiceStatus.CREATED, InvoiceStatus.PENDING, InvoiceStatus.PAID].includes(invoice?.status) &&
      (!invoice.expiredAt || invoice.expiredAt > dateHelper.getUTCTimestamp())
    ) {
      const channels = await this.invoicesDomainService.getChannels(organizationId)
      return InvoicePublicDto.map(invoice, channels)
    } else return {}
  }

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: InvoiceDto })
  async create(
    @OrganizationId() organizationId: string,
    @Param('organizationId') organizationPublicId: string,
    @Body() createInvoiceDto: CreateInvoiceDto
  ) {
    switch (createInvoiceDto.source) {
      case InvoiceSource.DTCPAY:
        const invoice = await this.invoicesDomainService.create(organizationId, organizationPublicId, createInvoiceDto)
        return InvoiceDto.map(invoice)
      default:
        throw new BadRequestException('Invalid invoice source')
    }
  }

  @Post(':id/public/generate-qr')
  @NoAuth()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: InvoiceDto })
  async generateQr(
    @OrganizationId() organizationId: string,
    @Param('id') publicId: string,
    @Body() generateQrDto: GenerateQrDto
  ) {
    const invoice = await this.invoicesDomainService.generateQr(organizationId, publicId, generateQrDto)
    return InvoicePublicDto.map(invoice)
  }

  @Post(':id/cancel')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: InvoiceDto })
  async cancel(@OrganizationId() organizationId: string, @Param('id') publicId: string) {
    const invoice = await this.invoicesDomainService.cancel(organizationId, publicId)
    return InvoiceDto.map(invoice)
  }

  @Post('sync')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200 })
  async sync(@OrganizationId() organizationId: string) {
    await this.invoicesDomainService.sync(organizationId)
    return
  }

  @Post('sync/dtcpay')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200 })
  async syncDtcpay(
    @OrganizationId() organizationId: string,
    @Param('organizationId') organizationPublicId: string,
    @Res() res: Response
  ) {
    res.status(200).json({ status: 'ok' })
    await this.invoicesDomainService.syncDtcpay(organizationId)
  }

  @Post(':id/refreshFromSource')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: InvoiceDto })
  async refreshFromSource(@OrganizationId() organizationId: string, @Param('id') publicId: string) {
    const invoice = await this.invoicesDomainService.refreshFromSource(organizationId, publicId)
    return InvoiceDto.map(invoice)
  }
}
