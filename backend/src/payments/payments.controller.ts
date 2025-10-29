import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { Response } from 'express'
import { PaymentsDomainService } from './payments.domain.service'
import {
  CreatePaymentDto,
  PaymentDto,
  PaymentsQueryParams,
  RecipientDto,
  RecipientsQueryParams,
  SetExecutedPaymentDto,
  SetExecutingPaymentsDto,
  SetFailedPaymentsDto,
  UpdatePaymentDto
} from './interfaces'
import { PaginationResponse } from '../core/interfaces'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { Action, Resource } from '../permissions/interfaces'
import { CurrencyType } from '../shared/entity-services/payments/interfaces'

@ApiTags('payments')
@ApiBearerAuth()
@RequirePermissionResource(Resource.PAYMENTS)
@UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
@Controller()
export class PaymentsController {
  constructor(private paymentsDomainService: PaymentsDomainService) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaginationResponse })
  async findAll(
    @OrganizationId() organizationId: string,
    @Query() paymentsQueryParams: PaymentsQueryParams
  ): Promise<PaginationResponse<PaymentDto>> {
    return await this.paymentsDomainService.getAllPaging(organizationId, paymentsQueryParams)
  }

  @Get('recipients')
  @RequirePermissionAction(Action.READ)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: RecipientDto, isArray: true })
  async getRecipients(
    @OrganizationId() organizationId: string,
    @Query() recipientsQueryParams: RecipientsQueryParams
  ): Promise<RecipientDto[]> {
    return await this.paymentsDomainService.getRecipients(organizationId, recipientsQueryParams)
  }

  @Get(':id')
  @RequirePermissionAction(Action.READ)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentDto })
  async find(@Param('id') paymentPublicId: string, @OrganizationId() organizationId: string): Promise<PaymentDto> {
    return await this.paymentsDomainService.getPayment(paymentPublicId, organizationId)
  }

  @Post(':id/get-quote')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentDto })
  async getQuote(
    @Param('id') paymentPublicId: string,
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string
  ): Promise<PaymentDto> {
    return await this.paymentsDomainService.getQuote(paymentPublicId, organizationId, accountId)
  }

  @Post(':id/set-created')
  @RequirePermissionAction(Action.UPDATE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentDto })
  async setCreated(
    @Param('id') paymentPublicId: string,
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string
  ): Promise<PaymentDto> {
    return await this.paymentsDomainService.setAsCreated(paymentPublicId, organizationId, accountId)
  }

  @Post(':id/set-pending')
  @RequirePermissionAction(Action.UPDATE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentDto })
  async setPending(
    @Param('id') paymentPublicId: string,
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string
  ): Promise<PaymentDto> {
    return await this.paymentsDomainService.setAsPending(paymentPublicId, organizationId, accountId)
  }

  @Post(':id/set-approved')
  @RequirePermissionAction(Action.UPDATE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentDto })
  async setApproved(
    @Param('id') paymentId: string,
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string
  ): Promise<PaymentDto> {
    return await this.paymentsDomainService.setAsApproved(paymentId, organizationId, accountId)
  }

  @Post('set-executing')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiBody({ type: SetExecutingPaymentsDto })
  @ApiResponse({ status: 200, type: PaymentDto })
  async setExecuting(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() setExecutingPaymentsDto: SetExecutingPaymentsDto
  ): Promise<PaymentDto[]> {
    return await this.paymentsDomainService.setAsExecuting(setExecutingPaymentsDto, organizationId, accountId)
  }

  @Post('set-executed')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiBody({ type: SetExecutedPaymentDto, isArray: true })
  @ApiResponse({ status: 200, type: PaymentDto, isArray: true })
  async setExecuted(
    @OrganizationId() organizationId: string,
    @Body(new ParseArrayPipe({ items: SetExecutedPaymentDto })) setExecutedPaymentDtos: SetExecutedPaymentDto[]
  ): Promise<PaymentDto[]> {
    return await this.paymentsDomainService.setAsExecuted(setExecutedPaymentDtos, organizationId)
  }

  @Post('set-failed')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiBody({ type: SetFailedPaymentsDto })
  @ApiResponse({ status: 200, type: PaymentDto })
  async setFailed(
    @OrganizationId() organizationId: string,
    @Body() setFailedPaymentsDto: SetFailedPaymentsDto
  ): Promise<PaymentDto[]> {
    return await this.paymentsDomainService.setAsFailed(setFailedPaymentsDto, organizationId)
  }

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiBody({ type: CreatePaymentDto, isArray: true })
  @ApiResponse({ status: 200, isArray: true, type: PaymentDto })
  async create(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body(new ParseArrayPipe({ items: CreatePaymentDto })) createPaymentDtos: CreatePaymentDto[]
  ): Promise<PaymentDto[]> {
    // For backwards compatibility
    for (const createPaymentDto of createPaymentDtos.filter(
      (createPaymentDto) => createPaymentDto.destinationCurrencyType == CurrencyType.CRYPTO
    )) {
      createPaymentDto.sourceCryptocurrencyId =
        createPaymentDto.sourceCryptocurrencyId ?? createPaymentDto.cryptocurrencyId
      createPaymentDto.destinationCurrencyId =
        createPaymentDto.destinationCurrencyId ?? createPaymentDto.cryptocurrencyId
      createPaymentDto.sourceAmount = createPaymentDto.sourceAmount ?? createPaymentDto.amount
      createPaymentDto.destinationAmount = createPaymentDto.destinationAmount ?? createPaymentDto.amount
    }

    return await this.paymentsDomainService.createPayments(organizationId, accountId, createPaymentDtos)
  }

  @Post(':id')
  @RequirePermissionAction(Action.UPDATE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, type: PaymentDto })
  async update(
    @Param('id') paymentPublicId: string,
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() updatePaymentDto: UpdatePaymentDto
  ): Promise<PaymentDto> {
    // For backwards compatibility
    updatePaymentDto.sourceCryptocurrencyId =
      updatePaymentDto.sourceCryptocurrencyId ?? updatePaymentDto.cryptocurrencyId
    updatePaymentDto.destinationCurrencyId = updatePaymentDto.destinationCurrencyId ?? updatePaymentDto.cryptocurrencyId
    updatePaymentDto.sourceAmount = updatePaymentDto.sourceAmount ?? updatePaymentDto.amount
    updatePaymentDto.destinationAmount = updatePaymentDto.destinationAmount ?? updatePaymentDto.amount

    return await this.paymentsDomainService.updatePayment(paymentPublicId, organizationId, accountId, updatePaymentDto)
  }

  @Delete(':id')
  @RequirePermissionAction(Action.DELETE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENTS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') paymentPublicId: string, @OrganizationId() organizationId: string) {
    await this.paymentsDomainService.deletePayment(paymentPublicId, organizationId)
  }

  // NOTE: For pending transactions to retrieve payment attachments
  @Get(':id/files/:file')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200 })
  async getFile(
    @Param('organizationId') organizationId: string,
    @Param('id') paymentPublicId: string,
    @Param('file') file: string,
    @Res() res: Response
  ) {
    const { filename, mimeType, fileStream } = await this.paymentsDomainService.getFile(
      organizationId,
      paymentPublicId,
      file
    )

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`
    })
    fileStream.pipe(res)
  }
}
