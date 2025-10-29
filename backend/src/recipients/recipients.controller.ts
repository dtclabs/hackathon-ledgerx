import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PaginationResponse } from '../core/interfaces'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { ContactProvidersService } from '../shared/entity-services/contacts/contacts/contacts.entity-service'
import { Recipient } from '../shared/entity-services/contacts/recipient.entity'
import { RecipientsEntityService } from '../shared/entity-services/contacts/recipients.entity-service'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { CreateRecipientDto, RecipientQuery, UpdateRecipientDto } from './interface'
import { RecipientsControllerService } from './recipients.controller.service'

@ApiTags('recipients')
@ApiBearerAuth()
@RequirePermissionResource(Resource.RECIPIENTS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class RecipientsController {
  constructor(
    private contactProvidersService: ContactProvidersService,
    private recipientsService: RecipientsEntityService,
    private recipientsControllerService: RecipientsControllerService
  ) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PaginationResponse })
  async getAll(@Query() query: RecipientQuery, @Param('organizationId') organizationId: string) {
    return this.recipientsService.getRecipients(query, organizationId)
  }

  @Get('contact-provider')
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getContactProviders() {
    return this.contactProvidersService.find({})
  }

  @Get(':id')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getRecipient(@Param('id') id: string, @OrganizationId() organizationId: string) {
    return this.recipientsControllerService.getByIdAndOrganization(id, organizationId)
  }

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async createRecipient(@Body() createRecipientDto: CreateRecipientDto, @OrganizationId() organizationId: string) {
    return this.recipientsControllerService.create(createRecipientDto, organizationId)
  }

  @Put(':id')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: Recipient })
  @RequirePermissionAction(Action.UPDATE)
  async update(
    @Body(new ValidationPipe()) updateRecipientDto: UpdateRecipientDto,
    @Param('id') id: string,
    @OrganizationId() organizationId: string
  ) {
    return this.recipientsControllerService.update({
      updateRecipientDto,
      organizationId,
      id
    })
  }

  @Delete(':id')
  @RequirePermissionAction(Action.DELETE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async delete(@Param('id') id: string, @OrganizationId() organizationId: string) {
    return this.recipientsControllerService.delete(id, organizationId)
  }
}
