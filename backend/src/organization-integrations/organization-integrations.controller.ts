import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AccountingService } from '../domain/integrations/accounting/accounting.service'
import { Action, Resource } from '../permissions/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { COASource } from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { IntegrationRetryRequestEntityService } from '../shared/entity-services/integration-retry-request/integration-retry-request.entity.service'
import { IntegrationSyncRequestsEntityService } from '../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.service'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import {
  OrganizationIntegrationDisconnectType,
  OrganizationIntegrationStatus
} from '../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsEntityService } from '../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import {
  accountingIntegrations,
  CreateOrganizationIntegrationDTO,
  IntegrationMetadataDTO,
  OrganizationIntegrationDTO,
  OrganizationIntegrationQueryParams,
  SubmitDTO,
  SwapTokenDTO
} from './interfaces'
import { OrganizationIntegrationsDomainService } from '../domain/organization-integrations/organization-integrations.domain.service'
import { OrganizationIntegrationsService } from './organization-integrations.service'
import { IntegrationSyncRequestStatus } from '../shared/entity-services/integration-sync-requests/integration-sync-request.entity'
import { SubscriptionsDomainService } from '../domain/subscriptions/subscriptions.domain.service'
import { AccountStatus, Platform } from '../domain/integrations/accounting/interfaces'
import { FeatureFlagOption } from '../shared/entity-services/feature-flags/interfaces'
import { FeatureFlagsEntityService } from '../shared/entity-services/feature-flags/feature-flags.entity-service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RootfiMigrationEventType } from '../domain/organization-integrations/listeners/rootfi-migration'

@ApiTags('organization-integrations')
@ApiBearerAuth()
@RequirePermissionResource(Resource.ORGANIZATION_INTEGRATIONS)
@RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.INTEGRATIONS)
@UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
@Controller()
export class OrganizationIntegrationsController {
  constructor(
    private organizationIntegrationsDomainService: OrganizationIntegrationsDomainService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private integrationSyncRequestsService: IntegrationSyncRequestsEntityService,
    private organizationIntegrationsService: OrganizationIntegrationsService,
    private integrationRetryRequestEntityService: IntegrationRetryRequestEntityService,
    private featureFlagsEntityService: FeatureFlagsEntityService,
    private accountingService: AccountingService,
    private logger: LoggerService,
    private subscriptionsDomainService: SubscriptionsDomainService,
    private eventEmitter: EventEmitter2
  ) {}

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async createNewOrganisationIntegration(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() createOrganizationIntegrationDto: CreateOrganizationIntegrationDTO
  ) {
    if (await this.featureFlagsEntityService.isFeatureEnabled(FeatureFlagOption.SUBSCRIPTION_PLAN_PERMISSION)) {
      const doesOrganizationHasIntegration = await this.subscriptionsDomainService.hasIntegration(
        organizationId,
        createOrganizationIntegrationDto.integrationName
      )
      if (!doesOrganizationHasIntegration) {
        throw new ForbiddenException()
      }
    }
    let integrationNames = [createOrganizationIntegrationDto.integrationName]
    let platform: Platform = null
    if (accountingIntegrations.includes(createOrganizationIntegrationDto.integrationName)) {
      integrationNames = [...accountingIntegrations]
      platform = await this.accountingService.getAvailablePlatformName(organizationId, IntegrationName.XERO)
    }
    const organizationIntegrationResults =
      await this.organizationIntegrationsEntityService.getByIntegrationNamesAndOrganizationIdAndStatus({
        integrationNames,
        organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED, OrganizationIntegrationStatus.TOKEN_SWAPPED],
        platform: platform
      })

    if (organizationIntegrationResults) {
      throw new BadRequestException('Organization integration already existed')
    }

    if (createOrganizationIntegrationDto.integrationName === IntegrationName.REQUEST_FINANCE) {
      return await this.organizationIntegrationsService.initializeNewRequestFinanceIntegration(
        organizationId,
        createOrganizationIntegrationDto
      )
    } else if (accountingIntegrations.includes(createOrganizationIntegrationDto.integrationName)) {
      return await this.organizationIntegrationsService.initializeNewAccountingIntegration(
        organizationId,
        accountId,
        createOrganizationIntegrationDto
      )
    } else if (createOrganizationIntegrationDto.integrationName === IntegrationName.DTCPAY) {
      return await this.organizationIntegrationsService.initializeNewDtcpayIntegration(
        organizationId,
        createOrganizationIntegrationDto
      )
    }
  }

  @Post(':integrationName/swapToken')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'string' })
  async swapToken(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Param('integrationName') integrationName: IntegrationName,
    @Body() swapTokenDTO: SwapTokenDTO
  ) {
    this.logger.warning('swapToken API called', { organizationId, integrationName })
    const platform = await this.accountingService.getAvailablePlatformName(organizationId, integrationName)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName,
        organizationId,
        platform: platform,
        statuses: [OrganizationIntegrationStatus.INITIATED],
        relations: { integration: true, organizationIntegrationAuth: true }
      })
    if (!organizationIntegration) {
      throw new NotFoundException(`Cannot find organization integration`)
    }

    if (
      organizationIntegration.organizationIntegrationAuth &&
      !organizationIntegration.organizationIntegrationAuth.rootfiOrgId
    ) {
      throw new ConflictException(`Account token already exists`)
    }

    // if rootfiOrgId is available, use rootfiService
    if (organizationIntegration.organizationIntegrationAuth?.rootfiOrgId) {
      organizationIntegration.status = OrganizationIntegrationStatus.TOKEN_SWAPPED
    } else {
      const mergeAccountTokenResult = await this.organizationIntegrationsService.getAccountToken(swapTokenDTO.token)
      await this.organizationIntegrationsEntityService.addAuthToOrganizationIntegration({
        organizationIntegrationId: organizationIntegration.id,
        accessToken: mergeAccountTokenResult.account_token
      })
      organizationIntegration.status = OrganizationIntegrationStatus.TOKEN_SWAPPED
    }

    // update the organization integration status to Migrating if enableRootfiMigration == true && platform == PlatformName.ROOTFI
    // otherwise it is TOKEN_SWAPPED
    // trigger workflow that updates COA
    // the condition to trigger are:
    // 1. platform is rootfi
    // 2. ENABLE_ROOTFI_MIGRATION is enabled

    // only update to migrating and emit event if migrationStatus is need_upgraded
    if (await this.organizationIntegrationsService.needMigratingToRootfi(organizationId)) {
      // set status of organization integration to migrating
      organizationIntegration.status = OrganizationIntegrationStatus.MIGRATING
      // create workflow to start updating COA asynchronously
      this.eventEmitter.emit(RootfiMigrationEventType.COA, organizationId, integrationName)
    } else if (accountingIntegrations.includes(integrationName)) {
      // this organization might connect before, and might already have COAs
      // which are updated to 'hq' when the integration was disconnected
      // we will try to recover all COA back
      if (
        await this.organizationIntegrationsService.recoverPreviousLinkedChartOfAccounts(organizationId, integrationName)
      ) {
        // update organization integration to COMPLETED
        organizationIntegration.status = OrganizationIntegrationStatus.COMPLETED
      }
    }
    await this.organizationIntegrationsEntityService.updateOrganizationIntegrationById(organizationIntegration.id, {
      status: organizationIntegration.status
    })
    await this.integrationRetryRequestEntityService.createByOrganizationAndIntegration(organizationId, integrationName)
    return OrganizationIntegrationDTO.map(organizationIntegration)
  }

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiResponse({ status: 200, type: OrganizationIntegrationDTO, isArray: true })
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getOrganizationIntegrations(
    @OrganizationId() organizationId: string,
    @Query() query: OrganizationIntegrationQueryParams
  ) {
    const organizationIntegrations = await this.organizationIntegrationsEntityService.getByOrganization({
      organizationId,
      ...(query.integrationName ? { integrationNames: [query.integrationName] } : {})
    })
    return organizationIntegrations.map((organizationIntegration) =>
      OrganizationIntegrationDTO.map(organizationIntegration)
    )
  }

  @Get(':integrationName')
  @RequirePermissionAction(Action.READ)
  @ApiResponse({ status: 200, type: OrganizationIntegrationDTO })
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getOrganizationIntegrationByName(
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: IntegrationName
  ) {
    if (!Object.values(IntegrationName).includes(integrationName)) {
      throw new BadRequestException('invalid integrationName')
    }
    const platform = await this.accountingService.getAvailablePlatformName(organizationId, integrationName)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: integrationName,
        organizationId,
        platform: platform
      })

    if (organizationIntegration) {
      // detect if user have disconnected from xero
      if (
        accountingIntegrations.includes(integrationName) &&
        [
          OrganizationIntegrationStatus.MIGRATING,
          OrganizationIntegrationStatus.TOKEN_SWAPPED,
          OrganizationIntegrationStatus.COMPLETED
        ].includes(organizationIntegration.status)
      ) {
        try {
          const companyInfo = await this.accountingService.getCompanyInfo(organizationId, integrationName)
          if (companyInfo) {
            organizationIntegration.metadata =
              await this.accountingService.getOrganizationIntegrationXeroMetaDataFromCompanyInfo(
                companyInfo,
                integrationName
              )
          }

          const accountStatus = await this.accountingService.getAccountStatus(
            organizationId,
            integrationName,
            companyInfo
          )
          if (accountStatus === AccountStatus.RELINK_NEEDED) {
            await this.organizationIntegrationsDomainService.disconnectIntegration(
              organizationIntegration.organization.id,
              organizationIntegration.integration.name,
              {
                disconnectType: OrganizationIntegrationDisconnectType.SYSTEM,
                disconnectDetails: {
                  detectionEntryPoint: 'Account is in RELINK_NEEDED status when getting organization integration'
                }
              }
            )
            throw new BadRequestException("You've disconnected from Xero")
          }
        } catch (e) {
          this.logger.warning('xero company get info error', organizationId, e)
        }
        return OrganizationIntegrationDTO.map(organizationIntegration)
      }
      throw new NotFoundException(`Can not find organization integration`)
    }
  }

  @Post(':integrationName/submit')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'string' })
  async submit(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Param('integrationName') integrationName: IntegrationName,
    @Body() submitDTO: SubmitDTO
  ) {
    const platform = await this.accountingService.getAvailablePlatformName(organizationId, integrationName)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: integrationName,
        organizationId,
        platform: platform,
        statuses: [OrganizationIntegrationStatus.TOKEN_SWAPPED],
        relations: { integration: true, organization: true, organizationIntegrationAuth: true }
      })

    if (!organizationIntegration) {
      throw new NotFoundException(`Can not find organization integration`)
    }
    if (!organizationIntegration.organizationIntegrationAuth) {
      throw new NotFoundException('Integrations Auth not found')
    }

    if (submitDTO.migrationData?.length) {
      const publicIds = submitDTO.migrationData.map((item) => item.previousCOAId)
      const COAPublicIdResult = await this.chartOfAccountsEntityService.findByPublicIdsAndOrganization(
        publicIds,
        organizationId
      )
      if (COAPublicIdResult.length !== publicIds.length)
        throw new BadRequestException('Invalid previous chart of account id in migration data')

      for (const migrationData of submitDTO.migrationData) {
        if (migrationData.remoteId) {
          const isMatched = submitDTO.COAData.find((coaData) => coaData.remoteId === migrationData.remoteId)

          if (!isMatched) {
            throw new BadRequestException('Invalid remote id in migration data')
          }
        }
      }
    }

    try {
      await this.organizationIntegrationsService.findCOARemoteIdAndSave(
        organizationIntegration.organizationIntegrationAuth.accessToken,
        submitDTO.COAData,
        integrationName,
        organizationId,
        accountId
      )
    } catch (error) {
      this.logger.error('findCOARemoteIdAndSave has errors', error)
      throw new NotFoundException(error)
    }

    await this.organizationIntegrationsService.tagNewCOAtoFinancialMetaData(submitDTO.migrationData)

    organizationIntegration.status = OrganizationIntegrationStatus.COMPLETED
    await Promise.all([
      this.organizationIntegrationsEntityService.updateOrganizationIntegrationById(organizationIntegration.id, {
        status: organizationIntegration.status
      }),
      this.integrationSyncRequestsService.create({
        integration: { name: integrationName },
        organization: { id: organizationId },
        requestedBy: accountId,
        requestedFor: 'coa',
        status: IntegrationSyncRequestStatus.SYNCED,
        syncedAt: dateHelper.getUTCTimestamp()
      }),
      this.chartOfAccountsEntityService.deleteChartOfAccountsByOrganization({
        organization: { id: organizationId },
        source: COASource.HQ
      })
    ])
    return organizationIntegration
  }

  @Post(':integrationName/disconnect')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'string' })
  async disconnect(
    @AccountId() accountId: string,
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: IntegrationName
  ) {
    await this.organizationIntegrationsDomainService.disconnectIntegration(organizationId, integrationName, {
      disconnectType: OrganizationIntegrationDisconnectType.USER,
      disconnectDetails: { accountId }
    })
  }

  @Post(':integrationName/sync-settings')
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'string' })
  async syncIntegrationSettings(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Param('integrationName') integrationName: IntegrationName
  ) {
    const platform = await this.accountingService.getAvailablePlatformName(organizationId, integrationName)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: integrationName,
        organizationId,
        platform: platform,
        statuses: [OrganizationIntegrationStatus.TOKEN_SWAPPED, OrganizationIntegrationStatus.COMPLETED],
        relations: { integration: true, organization: true, organizationIntegrationAuth: true }
      })

    if (!organizationIntegration) {
      throw new NotFoundException(`Can not find organization integration`)
    }
    const accessToken = organizationIntegration.organizationIntegrationAuth?.accessToken
    if (integrationName === IntegrationName.XERO) {
      return await this.organizationIntegrationsService.syncXeroSettings({
        accountId,
        integrationName,
        organizationId,
        accessToken
      })
    }
    // TODO: Add logic to other integrations here
    return null
  }

  @Get(':integrationName/meta-data')
  @RequirePermissionAction(Action.READ)
  @ApiResponse({ status: 200, type: IntegrationMetadataDTO })
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'integrationName', type: 'string' })
  async getIntegrationMetadata(
    @OrganizationId() organizationId: string,
    @Param('integrationName') integrationName: IntegrationName
  ): Promise<IntegrationMetadataDTO> {
    if (![IntegrationName.XERO, IntegrationName.QUICKBOOKS].includes(integrationName)) {
      throw new BadRequestException('invalid integrationName')
    }
    const platform = await this.accountingService.getAvailablePlatformName(organizationId, integrationName)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: integrationName,
        organizationId,
        platform: platform
      })
    if (!organizationIntegration) {
      throw new NotFoundException()
    }
    const metadata = await this.accountingService.getCompanyInfo(organizationId, integrationName)
    return IntegrationMetadataDTO.map(metadata)
  }
}
