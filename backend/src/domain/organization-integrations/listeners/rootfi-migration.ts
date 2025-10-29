import { Injectable } from '@nestjs/common'
import { IntegrationName } from '../../../shared/entity-services/integration/integration.entity'
import { OnEvent } from '@nestjs/event-emitter'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { LoggerService } from '../../../shared/logger/logger.service'
import { OrganizationIntegrationsEntityService } from '../../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { OrganizationIntegrationStatus } from '../../../shared/entity-services/organization-integrations/interfaces'
import { Platform, SyncStatus } from '../../integrations/accounting/interfaces'
import { FeatureFlagOption } from '../../../shared/entity-services/feature-flags/interfaces'
import { AccountingService } from '../../integrations/accounting/accounting.service'
import { ChartOfAccountsEntityService } from '../../../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { COASourceStatus } from '../../../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { ConfigService } from '@nestjs/config'
import { OrganizationIntegration } from '../../../shared/entity-services/organization-integrations/organization-integration.entity'
import { dateHelper } from '../../../shared/helpers/date.helper'

export enum RootfiMigrationEventType {
  COA = 'rootfi.migrate.coa'
}

const DELAY = 10000
const MAX_RETRY = 10

@Injectable()
export class RootfiMigrationListener {
  constructor(
    private configService: ConfigService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private accountingService: AccountingService,
    private chartOfAccountsEntityService: ChartOfAccountsEntityService
  ) {}

  @OnEvent(RootfiMigrationEventType.COA, { async: true, promisify: true })
  async rootfiMigration(organizationId: string, integrationName: IntegrationName) {
    this.logger.info('[RootfiMigration] Start migrating data to rootfi', { organizationId, integrationName })
    try {
      let isRootfiEnabled = await this.featureFlagsService.isFeatureEnabled(FeatureFlagOption.ENABLE_ROOTFI_SERVICE)
      if (!isRootfiEnabled) {
        isRootfiEnabled = await this.featureFlagsService.isFeatureWhitelisted(
          organizationId,
          FeatureFlagOption.ENABLE_ROOTFI_SERVICE
        )
      }
      const isRootfiMigrationEnabled = await this.featureFlagsService.isFeatureEnabled(
        FeatureFlagOption.ENABLE_ROOTFI_MIGRATION
      )

      if (!isRootfiEnabled || !isRootfiMigrationEnabled) return

      // get organization integration has rootfi and only apply for token_swapped
      // token_swapped is status that user has been linked with the platform and waiting for updating COA data
      const rootfiOrganizationIntegration =
        await this.organizationIntegrationsEntityService.getByIntegrationNamesAndOrganizationIdAndStatus({
          integrationNames: [integrationName],
          organizationId,
          statuses: [OrganizationIntegrationStatus.MIGRATING],
          platform: Platform.ROOTFI
        })
      if (!rootfiOrganizationIntegration) return

      // wait until rootfi ready for getting COA data
      try {
        await this.waitUntilReady(organizationId, integrationName)
      } catch (err) {
        this.logger.error('error while waiting for rootfi ready to get COA data', err, {
          organizationId,
          integrationName
        })
      }

      // get all integration COA from accounting service
      const rootfiAccounts = await this.accountingService.getCOAFromIntegrationWithRootfi(
        organizationId,
        integrationName,
        {
          includeDeletedData: true
        }
      )
      if (rootfiAccounts.error) {
        this.logger.error('[RootfiMigration] error occurred while getting COA from integration', rootfiAccounts.error, {
          organizationId,
          integrationName
        })
        // update the organization integration status to failed
        await this.organizationIntegrationsEntityService.updateOrganizationIntegrationById(
          rootfiOrganizationIntegration.id,
          {
            status: OrganizationIntegrationStatus.FAILED
          }
        )
        return
      }
      if (rootfiAccounts.accounts.length === 0) {
        this.logger.debug('[RootfiMigration] no chart of accounts found from Rootfi', {
          organizationId,
          integrationName
        })
      }
      // get all active COAs with integrationName from database
      const chartOfAccounts = await this.chartOfAccountsEntityService.getByOrganizationIdAndStatus(
        organizationId,
        [COASourceStatus.ACTIVE],
        [integrationName]
      )
      // if no chart of accounts found in database update rootfi organization integration status to completed
      if (chartOfAccounts.length === 0) {
        this.logger.debug('[RootfiMigration] no chart of accounts found in database', {
          organizationId,
          integrationName
        })
        await this.updateOrganizationIntegrationsStatus(rootfiOrganizationIntegration)
        return
      }
      // find matched chart of accounts by using platformId
      const unmatchedIds: string[] = []
      for (const coa of chartOfAccounts) {
        let matched = false
        for (const rootfiAccount of rootfiAccounts.accounts) {
          // if current coa has rootfiId, and it matches with integration data then continue with other COAs
          if (coa.rootfiId && coa.rootfiId === rootfiAccount.id) {
            matched = true
            break
          }
          if (coa.platformId === rootfiAccount.remote_id) {
            matched = true
            // update rootfiId for this chart of account and continue with other COAs
            await this.chartOfAccountsEntityService.updateById(coa.id, { rootfiId: rootfiAccount.id })
            break
          }
        }
        if (!matched) {
          unmatchedIds.push(coa.id)
        }
      }
      if (unmatchedIds.length > 0) {
        const message = `[RootfiMigration] found unmatched chart of accounts while migrating data`
        this.logger.error(message, { organizationId, integrationName, unmatchedIds })
        // update the organization integration status to failed
        await this.organizationIntegrationsEntityService.updateOrganizationIntegrationById(
          rootfiOrganizationIntegration.id,
          {
            status: OrganizationIntegrationStatus.FAILED
          }
        )
        return
      }
      await this.updateOrganizationIntegrationsStatus(rootfiOrganizationIntegration)
      this.logger.info('[RootfiMigration] migrate to rootfi completed', { organizationId, integrationName })
    } catch (error) {
      this.logger.error(`[RootfiMigration] error while migrating data to rootfi`, error, {
        organizationId,
        integrationName
      })
    }
  }

  async updateOrganizationIntegrationsStatus(organizationIntegration: OrganizationIntegration) {
    // update the organization integration status to completed
    await this.organizationIntegrationsEntityService.updateOrganizationIntegrationById(organizationIntegration.id, {
      status: OrganizationIntegrationStatus.COMPLETED
    })
    // update merge's organization integration status to DISCONNECTED and deleted
    await this.organizationIntegrationsEntityService.updateOrganizationIntegration(
      {
        organizationId: organizationIntegration.organization.id,
        integrationName: organizationIntegration.integration.name,
        platforms: [Platform.MERGE]
      },
      {
        status: OrganizationIntegrationStatus.DISCONNECTED_STANDBY,
        deletedAt: dateHelper.getUTCTimestamp()
      }
    )
  }

  async waitUntilReady(organizationId: string, integrationName: IntegrationName): Promise<void> {
    let retry = 0
    while (retry < MAX_RETRY) {
      // get company info with forceUpdate to force getting companyInfo from rootfi
      const companyInfo = await this.accountingService.getCompanyInfo(organizationId, integrationName, true)
      this.logger.info('finish getting company info', {
        id: companyInfo.id,
        syncStatus: companyInfo.sync_status,
        connection: companyInfo.connection_status
      })
      if (companyInfo?.sync_status === SyncStatus.IDLE) {
        return
      }
      // sleep 10 sec before next retry
      await new Promise((r) => setTimeout(r, DELAY))
      retry++
      this.logger.info('retry...', { id: companyInfo.id, retry })
    }
    throw 'wait for rootfi ready has reached retry time'
  }
}
