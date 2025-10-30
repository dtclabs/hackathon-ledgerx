import { HttpStatus, Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { MergeService } from './merge/merge.service'
import { IntegrationName } from '../../../shared/entity-services/integration/integration.entity'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { Account as mergeAccount, XeroErrorDetails } from './merge/interfaces'
import { EXPONENTIAL_BACK_OFF_RETRY_IN_MS } from '../../../shared/constants'
import { IntegrationRetryRequestEntityService } from '../../../shared/entity-services/integration-retry-request/integration-retry-request.entity.service'
import { Accounting } from '@mergeapi/merge-sdk-typescript'
import { AccountToken } from '@mergeapi/merge-hris-node'
import { ChartOfAccount } from '../../../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import {
  Account,
  AccountDetails,
  AccountStatus,
  CompanyInfo,
  ConnectionStatus,
  DAYS_DIFF,
  GetAccountsCondition,
  GetCOAFromIntegrationOutput,
  LinkToken,
  Platform,
  PostJournalEntryResult,
  RateLimitError,
  RequestFormatENUM,
  ROOTFI_API_KEY,
  RootFiSyncStatusResult
} from './interfaces'
import { RootfiService } from './rootfi/rootfi.service'
import { setTimeout } from 'timers/promises'
import { JournalEntry } from '../../../shared/entity-services/journal-entries/journal-entry.entity'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../../../shared/entity-services/feature-flags/interfaces'
import { OrganizationIntegrationsEntityService } from '../../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import {
  OrganizationIntegrationMetadata,
  OrganizationIntegrationStatus,
  OrganizationIntegrationXeroMetadata
} from '../../../shared/entity-services/organization-integrations/interfaces'
import { TimezonesEntityService } from '../../../shared/entity-services/timezones/timezones.entity-service'
import { OrganizationIntegration } from '../../../shared/entity-services/organization-integrations/organization-integration.entity'

@Injectable()
export class AccountingService {
  PAGE_SIZE: number
  constructor(
    private readonly integrationRetryRequestEntityService: IntegrationRetryRequestEntityService,
    protected featureFlagsEntityService: FeatureFlagsEntityService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private timezonesEntityService: TimezonesEntityService,
    private logger: LoggerService,
    private configService: ConfigService,
    private mergeService: MergeService,
    private rootfiService: RootfiService
  ) {
    this.PAGE_SIZE = 100
  }

  private async callWithRetryCheck(fn: any, integration: IntegrationName, organization: string) {
    const integrationRetryRequestResult =
      await this.integrationRetryRequestEntityService.getOneByOrganizationAndIntegration(organization, integration)

    if (integrationRetryRequestResult && integrationRetryRequestResult.retryAt > dateHelper.getUTCTimestamp()) {
      throw new RateLimitError({
        message: 'Too many request',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        retryAt: integrationRetryRequestResult.retryAt
      })
    }

    try {
      const result = await fn
      await this.integrationRetryRequestEntityService.clearRetryCountAndRetryAt(integration, organization)
      return result
    } catch (e) {
      this.logger.error(`[AccountingServer] Error occurred while using callWithRetry err=${JSON.stringify(e)}`)
      // e.status is used in Merge
      // e.statusCode is used in RootFi
      const status = e.status || e.statusCode
      if (
        status &&
        ![HttpStatus.TOO_MANY_REQUESTS, HttpStatus.REQUEST_TIMEOUT, HttpStatus.GATEWAY_TIMEOUT].includes(status)
      ) {
        throw e
      }
      integrationRetryRequestResult.retryCount = integrationRetryRequestResult.retryCount
        ? integrationRetryRequestResult.retryCount + 1
        : 1

      const newRetryCountByMs = EXPONENTIAL_BACK_OFF_RETRY_IN_MS[integrationRetryRequestResult.retryCount]
      if (newRetryCountByMs) {
        const newRetryAt = dateHelper.getUTCTimestampMillisecondsForward(newRetryCountByMs)
        integrationRetryRequestResult.retryAt = newRetryAt
        await this.integrationRetryRequestEntityService.update(integrationRetryRequestResult)
        throw new RateLimitError({
          message: 'Too many request',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAt: newRetryAt
        })
      }
      throw new RateLimitError({
        message: 'Retry count exceeded',
        statusCode: HttpStatus.TOO_MANY_REQUESTS
      })
    }
  }

  async isRootFiAvailable(organizationId: string): Promise<boolean> {
    const isAvailableForAll = await this.featureFlagsEntityService.isFeatureEnabled(
      FeatureFlagOption.ENABLE_ROOTFI_SERVICE
    )
    if (isAvailableForAll) return true

    const isEnabled = await this.featureFlagsEntityService.isFeatureWhitelisted(
      organizationId,
      FeatureFlagOption.ENABLE_ROOTFI_SERVICE
    )
    const apiKey = this.configService.get(ROOTFI_API_KEY)
    return isEnabled && apiKey && apiKey !== ''
  }

  async postJournalEntries(
    journalEntry: JournalEntry,
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<PostJournalEntryResult> {
    const isRootfiAvailable = await this.isRootFiAvailable(organizationId)
    return await this.callWithRetryCheck(
      isRootfiAvailable
        ? this.postJournalEntriesWithRootfi(journalEntry, organizationId, integrationName)
        : this.postJournalEntriesWithMerge(journalEntry, organizationId, integrationName, accountToken),
      integrationName,
      organizationId
    )
  }

  async postJournalEntriesWithRootfi(
    journalEntry: JournalEntry,
    organizationId: string,
    integrationName: IntegrationName
  ): Promise<PostJournalEntryResult> {
    const result = await this.rootfiService.postJournalEntries(journalEntry, organizationId, integrationName)
    return {
      remoteId: result.data.platform_unique_id,
      updatedAt: new Date(result.data.updated_at)
    }
  }

  async postJournalEntriesWithMerge(
    journalEntry: JournalEntry,
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<PostJournalEntryResult> {
    const result = await this.mergeService.postJournalEntries(
      journalEntry,
      organizationId,
      integrationName,
      accountToken
    )
    return {
      remoteId: result.model?.remote_id,
      updatedAt: result.model?.modified_at
    }
  }

  async getCompanyInfo(
    organizationId: string,
    integrationName: IntegrationName,
    forceUpdate?: boolean
  ): Promise<CompanyInfo> {
    const isForceUpdate = forceUpdate === true
    const isRootfiAvailable = await this.isRootFiAvailable(organizationId)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName,
        organizationId,
        platform: isRootfiAvailable ? Platform.ROOTFI : Platform.MERGE,
        statuses: [
          OrganizationIntegrationStatus.TOKEN_SWAPPED,
          OrganizationIntegrationStatus.COMPLETED,
          OrganizationIntegrationStatus.MIGRATING
        ],
        relations: { organization: true, integration: true, organizationIntegrationAuth: true }
      })
    if (!organizationIntegration) return null
    if (!isForceUpdate && organizationIntegration.metadata) {
      const metadata: OrganizationIntegrationXeroMetadata =
        organizationIntegration.metadata as OrganizationIntegrationXeroMetadata
      if (
        metadata.companyName &&
        metadata.currency &&
        metadata.updated_at &&
        dateHelper.getDaysDifferenceFromTime(new Date(metadata.updated_at)) <= DAYS_DIFF
      ) {
        const companyInfo = {
          name: metadata.companyName,
          timezone: metadata.timezone,
          currency: metadata.currency,
          connection_status: metadata.connection_status,
          sync_status: metadata.sync_status,
          updated_at: new Date(metadata.updated_at)
        }
        this.logger.info('returning company info from metadata', {
          companyInfo
        })
        return companyInfo
      }
    }
    return await this.callWithRetryCheck(
      this.getCompanyInfoAndUpdateToOrganizationIntegration(isRootfiAvailable, organizationIntegration),
      integrationName,
      organizationId
    )
  }

  async getAccountStatus(
    organizationId: string,
    integrationName: IntegrationName,
    companyInfo: CompanyInfo
  ): Promise<AccountStatus> {
    return await this.callWithRetryCheck(
      this.getAccountStatusWithRootfi(companyInfo.connection_status),
      integrationName,
      organizationId
    )
  }

  async getAccountStatusWithRootfi(connectionStatus: ConnectionStatus): Promise<AccountStatus> {
    return [ConnectionStatus.HEALTHY, ConnectionStatus.PENDING].includes(connectionStatus)
      ? AccountStatus.COMPLETE
      : AccountStatus.RELINK_NEEDED
  }

  async getAccountStatusWithMerge(
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<AccountDetails> {
    const accountDetails = await this.mergeService.getAccountDetails(organizationId, integrationName, accountToken)
    return {
      status: accountDetails.status as AccountStatus
    }
  }

  async getCompanyInfoAndUpdateToOrganizationIntegration(
    isRootfiAvailable: boolean,
    organizationIntegration: OrganizationIntegration
  ): Promise<CompanyInfo> {
    // get company info from rootfi and update metadata to organization integration
    const companyInfo = isRootfiAvailable
      ? await this.rootfiService.getCompanyInfo(
          organizationIntegration.organization.id,
          organizationIntegration.integration.name
        )
      : await this.mergeService.getCompanyInfo(
          organizationIntegration.organization.id,
          organizationIntegration.integration.name,
          organizationIntegration.organizationIntegrationAuth.accessToken
        )
    if (!companyInfo) return null
    // set new updated_at to current UTC timestamp
    companyInfo.updated_at = dateHelper.getUTCTimestamp()

    // update company's timezone
    const timezone = await this.timezonesEntityService.getByXeroTimezone(companyInfo.timezone)
    companyInfo.timezone = timezone?.name

    const metadata = await this.getOrganizationIntegrationXeroMetaDataFromCompanyInfo(
      companyInfo,
      organizationIntegration.integration.name
    )

    await this.organizationIntegrationsEntityService.updateOrganizationIntegrationById(organizationIntegration.id, {
      metadata
    })
    this.logger.info('returning company info from platform', { companyInfo })
    return companyInfo
  }

  async getLinkToken(
    organizationId: string,
    organizationName: string,
    organizationEmail: string,
    integration: string
  ): Promise<LinkToken> {
    return (await this.isRootFiAvailable(organizationId))
      ? await this.rootfiService.getLinkToken(organizationName, integration)
      : await this.mergeService.getLinkToken(organizationName, organizationEmail, integration)
  }

  async getAccountToken(token: string): Promise<AccountToken> {
    return await this.mergeService.getAccountToken(token)
  }

  async deleteLinkedAccount(organizationId: string, rootfiOrgId?: number, accountToken?: string) {
    return (await this.isRootFiAvailable(organizationId))
      ? await this.rootfiService.deleteLinkedAccount(rootfiOrgId)
      : await this.mergeService.deleteLinkedAccount(accountToken)
  }

  toCheckWhichKeyChanged(
    f: Account,
    s: ChartOfAccount,
    integrationName: IntegrationName,
    isRootfiAvailable: boolean
  ): string[] {
    return !isRootfiAvailable
      ? this.mergeService.toCheckWhichKeyChanged(f, s, integrationName)
      : this.rootfiService.toCheckWhichKeyChanged(f, s, integrationName)
  }

  sanitize(item: any, integrationName: IntegrationName, isRootfiAvailable: boolean) {
    return !isRootfiAvailable ? item.raw_data && this.mergeService.sanitize(item.raw_data, integrationName) : true
  }

  async getCOAFromIntegration(
    organizationId: string,
    integrationName: IntegrationName,
    condition: {
      createdAfter?: Date
      createdBefore?: Date
      cursor?: string
      includeDeletedData?: boolean
      includeRemoteData?: boolean
      modifiedAfter?: Date
      modifiedBefore?: Date
      pageSize?: number
      remoteId?: string | null
    },
    accountToken: string
  ): Promise<GetCOAFromIntegrationOutput> {
    if (condition && !condition.pageSize) {
      condition.pageSize = this.PAGE_SIZE
    }
    const isRootfiAvailable = await this.isRootFiAvailable(organizationId)
    return await this.callWithRetryCheck(
      isRootfiAvailable
        ? this.getCOAFromIntegrationWithRootfi(organizationId, integrationName, condition)
        : this.getCOAFromIntegrationWithMerge(organizationId, integrationName, condition, accountToken),
      integrationName,
      organizationId
    )
  }

  async getCOAFromIntegrationWithRootfi(
    organizationId: string,
    integrationName: IntegrationName,
    condition: GetAccountsCondition
  ): Promise<GetCOAFromIntegrationOutput> {
    return {
      accounts: await this.rootfiService.getAccounts(organizationId, integrationName, condition)
    }
  }

  async getCOAFromIntegrationWithMerge(
    organizationId: string,
    integrationName: IntegrationName,
    condition: GetAccountsCondition,
    accountToken: string
  ): Promise<GetCOAFromIntegrationOutput> {
    let retryCount = 2
    let mergeAccounts: mergeAccount[] = []
    while (retryCount-- > 0) {
      mergeAccounts = await this.mergeService.getAccounts(condition, organizationId, integrationName, accountToken)

      if (mergeAccounts) {
        break
      }

      await setTimeout(3000)
    }

    let passThroughResult = null
    try {
      passThroughResult = await this.mergeService.passThrough(
        {
          method: Accounting.MethodEnumValues.Get,
          requestFormat: RequestFormatENUM.json
        },
        organizationId,
        integrationName
      )
      return {
        accounts: this.mergeService.getMatchedAccounts(mergeAccounts, passThroughResult, integrationName)
      }
    } catch (error) {
      this.logger.error(error, passThroughResult)

      if (
        integrationName === IntegrationName.XERO &&
        passThroughResult.status !== HttpStatus.OK &&
        passThroughResult.response.Detail === XeroErrorDetails.UNAUTHENTICATED
      ) {
        // return disconnect message
        return {
          disconnected: true,
          message: `${passThroughResult.response.Detail} error when getting COA from Merge`,
          error: error
        }
      }
    }
  }

  async getAvailablePlatformName(organizationId: string, integration: IntegrationName): Promise<Platform> {
    if (integration === IntegrationName.XERO || integration === IntegrationName.QUICKBOOKS) {
      return (await this.isRootFiAvailable(organizationId)) ? Platform.ROOTFI : Platform.MERGE
    }
    return null
  }

  compareAccount(sourceCOA: Account, localCOA: ChartOfAccount): boolean {
    return sourceCOA.remote_id === localCOA.platformId
  }

  async createSync(organizationId: string, integrationName: IntegrationName): Promise<RootFiSyncStatusResult> {
    return (await this.isRootFiAvailable(organizationId))
      ? this.rootfiService.createSync(organizationId, integrationName)
      : null
  }

  async getSync(organizationId: string, syncId: string): Promise<RootFiSyncStatusResult> {
    return (await this.isRootFiAvailable(organizationId)) ? this.rootfiService.getSync(syncId) : null
  }

  async getOrganizationIntegrationXeroMetaDataFromCompanyInfo(
    companyInfo: CompanyInfo,
    integrationName: IntegrationName
  ): Promise<OrganizationIntegrationXeroMetadata> {
    return {
      companyName: companyInfo.name,
      currency: companyInfo.currency,
      timezone: integrationName === IntegrationName.QUICKBOOKS ? null : companyInfo.timezone,
      connection_status: companyInfo.connection_status,
      sync_status: companyInfo.sync_status,
      updated_at: companyInfo.updated_at.getTime()
    }
  }
}
