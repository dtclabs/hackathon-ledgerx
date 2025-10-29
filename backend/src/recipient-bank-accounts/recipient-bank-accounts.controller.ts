import { UseGuards, Controller, Get, Query, Param, Post, Body, Delete, Put } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Resource } from '../permissions/interfaces'
import { RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import {
  CreateRecipientBankAccountDto,
  RecipientBankAccountDto,
  RecipientBankAccountsQueryParams,
  UpdateRecipientBankAccountDto
} from './interfaces'
import { RecipientBankAccountsControllerService } from './recipient-bank-accounts.controller.service'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { PaginationResponse } from '../core/interfaces'

@ApiTags('recipient-bank-accounts')
@ApiBearerAuth()
@RequirePermissionResource(Resource.RECIPIENTS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class RecipientBankAccountsController {
  constructor(private readonly recipientBankAccountsControllerService: RecipientBankAccountsControllerService) {}

  @Get()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'recipientId', type: 'string' })
  async findAll(
    @OrganizationId() organizationId: string,
    @Param('recipientId') recipientPublicId: string,
    @Query() query: RecipientBankAccountsQueryParams
  ): Promise<PaginationResponse<RecipientBankAccountDto>> {
    return await this.recipientBankAccountsControllerService.getAllPaging(organizationId, recipientPublicId, query)
  }

  @Get(':id')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'recipientId', type: 'string' })
  async find(
    @OrganizationId() organizationId: string,
    @Param('recipientId') recipientPublicId: string,
    @Param('id') recipientBankAccountPublicId: string
  ): Promise<RecipientBankAccountDto> {
    return await this.recipientBankAccountsControllerService.getRecipientBankAccount(
      recipientBankAccountPublicId,
      recipientPublicId,
      organizationId
    )
  }

  @Post()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'recipientId', type: 'string' })
  async create(
    @OrganizationId() organizationId: string,
    @Param('recipientId') recipientPublicId: string,
    @Body() createRecipientBankAccountDto: CreateRecipientBankAccountDto
  ): Promise<RecipientBankAccountDto> {
    return await this.recipientBankAccountsControllerService.createRecipientBankAccount(
      recipientPublicId,
      organizationId,
      createRecipientBankAccountDto
    )
  }

  @Put(':id')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'recipientId', type: 'string' })
  async update(
    @OrganizationId() organizationId: string,
    @Param('recipientId') recipientPublicId: string,
    @Param('id') recipientBankAccountPublicId: string,
    @Body() updateRecipientBankAccountDto: UpdateRecipientBankAccountDto
  ): Promise<RecipientBankAccountDto> {
    return await this.recipientBankAccountsControllerService.updateRecipientBankAccount(
      recipientBankAccountPublicId,
      recipientPublicId,
      organizationId,
      updateRecipientBankAccountDto
    )
  }

  @Delete(':id')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'recipientId', type: 'string' })
  async delete(
    @OrganizationId() organizationId: string,
    @Param('recipientId') recipientPublicId: string,
    @Param('id') recipientBankAccountPublicId: string
  ): Promise<void> {
    return await this.recipientBankAccountsControllerService.deleteRecipientBankAccount(
      recipientBankAccountPublicId,
      recipientPublicId,
      organizationId
    )
  }
}
