import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { CreateJournalEntryExportDto, GetJournalEntryExportQueryParams, JournalEntryExportDto } from './interfaces'
import { JournalEntryExportsDomainService } from './journal-entry-exports.domain.service'

@ApiTags('journal-entry-exports')
@ApiBearerAuth()
@RequirePermissionResource(Resource.JOURNAL_ENTRY_EXPORTS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class JournalEntryExportsController {
  constructor(private journalEntryExportsDomainService: JournalEntryExportsDomainService) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: JournalEntryExportDto })
  async getAll(
    @OrganizationId() organizationId: string,
    @Query() query: GetJournalEntryExportQueryParams
  ): Promise<JournalEntryExportDto[]> {
    return await this.journalEntryExportsDomainService.getJournalEntryExportsForOrganization(
      organizationId,
      query.integrationName,
      query.statuses
    )
  }

  @Post('')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: JournalEntryExportDto })
  async createJournalEntryExport(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() createJournalEntryExportDto: CreateJournalEntryExportDto
  ): Promise<JournalEntryExportDto> {
    return await this.journalEntryExportsDomainService.createJournalEntryExport({
      organizationId,
      requestedBy: accountId,
      integrationName: createJournalEntryExportDto.integrationName,
      type: createJournalEntryExportDto.type,
      financialTransactionParentPublicIds: createJournalEntryExportDto.financialTransactionParentIds,
      queryParams: createJournalEntryExportDto.queryParams
    })
  }

  @Post(':id/abort')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: JournalEntryExportDto })
  async abortJournalEntryExport(
    @OrganizationId() organizationId: string,
    @Param('id') id: string
  ): Promise<JournalEntryExportDto> {
    return await this.journalEntryExportsDomainService.abortJournalEntryExport({
      journalEntryExportWorkflowPublicId: id,
      organizationId
    })
  }

  @Post(':id/export')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: JournalEntryExportDto })
  async exportJournalEntryExport(
    @OrganizationId() organizationId: string,
    @Param('id') id: string
  ): Promise<JournalEntryExportDto> {
    return await this.journalEntryExportsDomainService.exportJournalEntryExport({
      journalEntryExportWorkflowPublicId: id,
      organizationId
    })
  }

  @Post(':id/cancel')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: JournalEntryExportDto })
  async cancelJournalEntryExport(
    @OrganizationId() organizationId: string,
    @Param('id') id: string
  ): Promise<JournalEntryExportDto> {
    return await this.journalEntryExportsDomainService.cancelJournalEntryExport({
      journalEntryExportWorkflowPublicId: id,
      organizationId
    })
  }
}
