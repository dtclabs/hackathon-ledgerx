import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'

import { AccountingService } from '../domain/integrations/accounting/accounting.service'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { IntegrationSyncRequestStatus } from '../shared/entity-services/integration-sync-requests/integration-sync-request.entity'
import { IntegrationSyncRequestsEntityService } from '../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.service'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import { OrganizationIntegrationStatus } from '../shared/entity-services/organization-integrations/interfaces'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { dateHelper } from '../shared/helpers/date.helper'
import { ChartOfAccountsService } from './chart-of-accounts.service'
import {
  ChartOfAccountDto,
  ChartOfAccountQueryParams,
  ChartOfAccountWithCountDto,
  CreateChartOfAccountDto,
  ImportSyncNewSaveDTO,
  SyncResponseDTO,
  SyncSaveDTO
} from './inferfaces'
import { Account } from '../domain/integrations/accounting/interfaces'

@ApiTags('chart-of-accounts')
@ApiBearerAuth()
@RequirePermissionResource(Resource.CHART_OF_ACCOUNTS)
@RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.CHART_OF_ACCOUNTS)
@UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
@Controller()
export class ChartOfAccountsController {
  constructor(
    private chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private chartOfAccountsService: ChartOfAccountsService,
    private accountingService: AccountingService,
    private integrationSyncRequestEntityService: IntegrationSyncRequestsEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService
  ) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: ChartOfAccountDto, isArray: true })
  async getChartOfAccounts(
    @OrganizationId() organizationId: string,
    @Query() query: ChartOfAccountQueryParams
  ): Promise<ChartOfAccountDto[]> {
    const chartOfAccounts = await this.chartOfAccountsService.getByOrganizationIdAndStatus(
      organizationId,
      query.statuses
    )

    return chartOfAccounts.map((coa) => ChartOfAccountDto.map(coa))
  }

  @Put(':id')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async updateHqCoa(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body() updateHqCoaDto: CreateChartOfAccountDto
  ) {
    return await this.chartOfAccountsService.updateHqCoa({
      organizationId,
      chartOfAccountPublicId: id,
      name: updateHqCoaDto.name,
      type: updateHqCoaDto.type,
      description: updateHqCoaDto.description,
      code: updateHqCoaDto.code
    })
  }

  @Delete(':id')
  @RequirePermissionAction(Action.DELETE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteChartOfAccount(@OrganizationId() organizationId: string, @Param('id') id: string) {
    await this.chartOfAccountsService.deleteChartOfAccount({
      organizationId,
      chartOfAccountPublicId: id
    })
  }

  @Post('')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: ChartOfAccountDto })
  async createChartOfAccount(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() createChartOfAccountMappingDto: CreateChartOfAccountDto
  ): Promise<ChartOfAccountDto> {
    return await this.chartOfAccountsService.createChartOfAccount({
      organizationId: organizationId,
      accountId: accountId,
      name: createChartOfAccountMappingDto.name,
      code: createChartOfAccountMappingDto.code,
      type: createChartOfAccountMappingDto.type,
      description: createChartOfAccountMappingDto.description
    })
  }

  @Get('/count')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getChartOfAccountCount(@OrganizationId() organizationId: number) {
    try {
      const COACount: any = await this.financialTransactionsEntityService.getCountByFinancialTrnx(organizationId)
      const result = COACount.map((value: any) => ({
        COA: {
          id: value.public_id,
          name: value.name,
          code: value.code,
          type: value.type,
          description: value.description
        },
        count: value.count
      }))
      return result
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getChartOfAccountById(@Param('id') id: string) {
    const result = await this.chartOfAccountsEntityService.findOne({ where: { publicId: id } })
    //To check if the COA exists
    if (!result) {
      throw new NotFoundException(`Can not find chart of accounts`)
    }
    return result
  }

  @Get('/pass-through/:integrationName/import-new')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'enum', enum: IntegrationName })
  @ApiOkResponse({ type: Account, isArray: true })
  async passThroughImportNew(
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: IntegrationName
  ): Promise<Account[]> {
    if (!(integrationName.toUpperCase() in IntegrationName)) {
      throw new BadRequestException('Invalid integrationName value')
    }
    const organizationIntegration = await this.chartOfAccountsService.getOrganizationIntegrationWithAuth(
      integrationName,
      organizationId,
      [OrganizationIntegrationStatus.TOKEN_SWAPPED, OrganizationIntegrationStatus.COMPLETED]
    )
    if (!organizationIntegration) {
      throw new NotFoundException(`Can not find organization integration`)
    }
    if (!organizationIntegration.organizationIntegrationAuth) {
      throw new Error(`Can not find organization integration auth`)
    }

    // try to sync COA before getting COA list from integration
    await this.chartOfAccountsService.syncCOA(organizationId, integrationName)

    const { newFromSource, isItSynced } = await this.chartOfAccountsService.getSourceSyncStatus(
      organizationIntegration.organizationIntegrationAuth.accessToken,
      organizationId,
      integrationName
    )
    if (!isItSynced && organizationIntegration.status !== OrganizationIntegrationStatus.TOKEN_SWAPPED) {
      throw new BadRequestException('Need to do a sync before importing')
    }

    return newFromSource
  }

  @Post('/pass-through/:integrationName/import-new/save')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'enum', enum: IntegrationName })
  async passThroughImportNewSave(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Param('integrationName') integrationName: IntegrationName,
    @Body() importNewSaveDTO: ImportSyncNewSaveDTO
  ) {
    if (!(integrationName.toUpperCase() in IntegrationName)) {
      throw new BadRequestException('Invalid integrationName value')
    }
    const organizationIntegration = await this.chartOfAccountsService.getOrganizationIntegrationWithAuth(
      integrationName,
      organizationId,
      [OrganizationIntegrationStatus.COMPLETED]
    )
    if (!organizationIntegration) {
      throw new NotFoundException(`Can not find organization integration`)
    }
    if (!organizationIntegration.organizationIntegrationAuth) {
      throw new Error(`Can not find organization integration auth`)
    }

    await this.chartOfAccountsService.findCOARemoteIdAndSave(
      organizationIntegration.organizationIntegrationAuth.accessToken,
      importNewSaveDTO.COAData,
      integrationName,
      organizationId,
      accountId
    )
    return
  }

  @Get('/pass-through/:integrationName/sync')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'enum', enum: IntegrationName })
  @ApiOkResponse({ type: SyncResponseDTO })
  async passThroughSyncNew(
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: IntegrationName
  ): Promise<SyncResponseDTO> {
    if (!(integrationName.toUpperCase() in IntegrationName)) {
      throw new BadRequestException('Invalid integrationName value')
    }
    const organizationIntegration = await this.chartOfAccountsService.getOrganizationIntegrationWithAuth(
      integrationName,
      organizationId,
      [OrganizationIntegrationStatus.COMPLETED]
    )

    // try to sync COA before getting COA list from integration
    await this.chartOfAccountsService.syncCOA(organizationId, integrationName)

    const { modifiedAccountLocallyList, archivedCOAList, deletedCOAList, restoredCOAList } =
      await this.chartOfAccountsService.getSourceSyncStatus(
        organizationIntegration.organizationIntegrationAuth.accessToken,
        organizationId,
        integrationName
      )

    const archivedCOAAtLocallyWithTxnCount: ChartOfAccountWithCountDto[] = []
    for (const archivedCOA of archivedCOAList) {
      const transactionCount = await this.financialTransactionsEntityService.getTransactionsCountByCOAId(archivedCOA.id)
      archivedCOAAtLocallyWithTxnCount.push(ChartOfAccountWithCountDto.map(archivedCOA, transactionCount))
    }

    const deletedCOAAtLocallyWithTxnCount: ChartOfAccountWithCountDto[] = []
    for (const deletedCOA of deletedCOAList) {
      const transactionCount = await this.financialTransactionsEntityService.getTransactionsCountByCOAId(deletedCOA.id)
      deletedCOAAtLocallyWithTxnCount.push(ChartOfAccountWithCountDto.map(deletedCOA, transactionCount))
    }

    // Temp fix for FE to read the below the same way as the others
    const restoredCOAAtLocallyWithPlaceholderTxnCount: ChartOfAccountWithCountDto[] = []
    for (const restoredCOA of restoredCOAList) {
      restoredCOAAtLocallyWithPlaceholderTxnCount.push(ChartOfAccountWithCountDto.map(restoredCOA, 0))
    }

    return SyncResponseDTO.map({
      modifiedCOA: modifiedAccountLocallyList,
      archivedCOA: archivedCOAAtLocallyWithTxnCount,
      deletedCOA: deletedCOAAtLocallyWithTxnCount,
      restoredCOA: restoredCOAAtLocallyWithPlaceholderTxnCount
    })
  }

  @Post('/pass-through/:integrationName/sync/save')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'enum', enum: IntegrationName })
  async passThroughSyncNewSave(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Param('integrationName') integrationName: IntegrationName,
    @Body() syncNewSaveDTO: SyncSaveDTO
  ) {
    if (!(integrationName.toUpperCase() in IntegrationName)) {
      throw new BadRequestException('Invalid integrationName value')
    }

    const syncedAt = dateHelper.getUTCTimestamp()
    const organizationIntegration = await this.chartOfAccountsService.getOrganizationIntegrationWithAuth(
      integrationName,
      organizationId,
      [OrganizationIntegrationStatus.COMPLETED]
    )

    const COAResultFromIntegration: Account[] = await this.chartOfAccountsService.getCOAFromIntegration(
      organizationId,
      integrationName,
      {},
      organizationIntegration.organizationIntegrationAuth.accessToken
    )
    //TODO Validate the input request by fetching the source sync status result
    const isRootfiAvailable = await this.accountingService.isRootFiAvailable(organizationId)
    const sanitizeSourceCOAResult = COAResultFromIntegration.filter((item) =>
      this.accountingService.sanitize(item, integrationName, isRootfiAvailable)
    )
    await Promise.all([
      // Below is to detect when it is modified in xero
      this.chartOfAccountsService.findCOARemoteIdAndUpdate(
        organizationId,
        sanitizeSourceCOAResult,
        syncNewSaveDTO.modifiedData
      ),

      // Below is to detect when it is archived/deleted/restored
      this.chartOfAccountsService.replaceOldCOAIdWithNewCOAId(
        syncNewSaveDTO.archivedData,
        syncNewSaveDTO.deletedData,
        syncNewSaveDTO.restoredData
      ),
      this.integrationSyncRequestEntityService.create({
        integration: { name: integrationName },
        organization: { id: organizationId },
        requestedBy: accountId,
        requestedFor: 'coa',
        status: IntegrationSyncRequestStatus.SYNCED,
        syncedAt
      })
    ])
    return
  }
}
