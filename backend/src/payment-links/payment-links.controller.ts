import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreatePaymentLinkDto, PaymentLinkDto } from './interfaces'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { Action, Resource } from '../permissions/interfaces'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { LoggerService } from '../shared/logger/logger.service'
import { PaymentLinkDomainService } from './payment-link.domain.service'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'

@ApiTags('payment-links')
@ApiBearerAuth()
@RequirePermissionResource(Resource.PAYMENT_LINKS)
@RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.PAYMENT_LINKS)
@UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
@Controller()
export class PaymentLinksController {
  constructor(private paymentLinkDomainService: PaymentLinkDomainService, private loggerService: LoggerService) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentLinkDto, isArray: true })
  async getAll(@OrganizationId() organizationId: string) {
    try {
      return await this.paymentLinkDomainService.getAll(organizationId)
    } catch (e) {
      this.loggerService.error(`Error while getting payment links: ${e.message}`, e, { organizationId })
      throw e
    }
  }

  @Get(':id')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentLinkDto })
  async get(@Param('id') publicId: string, @OrganizationId() organizationId: string) {
    try {
      const paymentLink = await this.paymentLinkDomainService.getById({
        publicId,
        organizationId
      })
      if (paymentLink) {
        return paymentLink
      }
    } catch (e) {
      this.loggerService.error(`Error while getting payment link: ${e.message}`, e, {
        id: publicId,
        organizationId
      })
      throw e
    }
    throw new NotFoundException()
  }

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaymentLinkDto })
  async create(
    @OrganizationId() organizationId: string,
    @Body(new ValidationPipe()) createPaymentLinkDto: CreatePaymentLinkDto
  ) {
    return await this.paymentLinkDomainService.create(organizationId, createPaymentLinkDto)
  }

  @Delete(':id')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @RequirePermissionAction(Action.DELETE)
  async delete(@OrganizationId() organizationId: string, @Param('id', new ParseUUIDPipe()) publicId: string) {
    await this.paymentLinkDomainService.delete(organizationId, publicId)
  }
}
