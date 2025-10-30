import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RootFiClient, RootFiError } from 'rootfi-api'
import { DataModels, IntegrationType, JournalLinesFields, JournalLineType } from 'rootfi-api/api'
import {
  CreateJournalEntryResponse,
  GetAccountsResponse,
  JournalEntryFields
} from 'rootfi-api/api/resources/accounting'
import { IntegrationCategory } from 'rootfi-api/api/resources/enums/types/IntegrationCategory'
import { ChartOfAccount } from '../../../../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { IntegrationName } from '../../../../shared/entity-services/integration/integration.entity'
import { JournalLineEntryType } from '../../../../shared/entity-services/journal-entries/interfaces'
import { JournalEntry } from '../../../../shared/entity-services/journal-entries/journal-entry.entity'
import { OrganizationIntegrationsEntityService } from '../../../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { OrganizationSettingsEntityService } from '../../../../shared/entity-services/organization-settings/organization-settings.entity-service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import {
  Account,
  Account as accountingAccount,
  COASourceStatus,
  COAType,
  CompanyInfo,
  ConnectionStatus,
  GetAccountsCondition,
  INVALID_INTEGRATION_NAME,
  INVALID_SYNC_STATUS,
  LinkToken,
  Platform,
  RootFiSyncStatus,
  RootFiSyncStatusResult,
  SYNC_OPERATION_DENIED,
  SyncStatus
} from '../interfaces'
import { CompanyTimeZoneAndCurrency, ROOTFI_INVITE_LINK } from './interfaces'

@Injectable()
export class RootfiService {
  rootfi: RootFiClient

  constructor(
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private organizationSettingsEntityService: OrganizationSettingsEntityService,
    private logger: LoggerService,
    private configService: ConfigService
  ) {
    this.rootfi = new RootFiClient({ apiKey: this.configService.get('ROOTFI_API_KEY') })
  }

  async getLinkToken(organizationName: string, integration: string): Promise<LinkToken> {
    // validate and get correct integration name that rootfi supports
    let integrationName: IntegrationType = null
    for (const integrationType of [IntegrationType.Xero, IntegrationType.Quickbooks]) {
      if (integration.toUpperCase().includes(integrationType)) {
        integrationName = integrationType
      }
    }
    if (!integrationName) {
      throw `invalid integration name as ${integration}`
    }
    const inviteLinkObject = await this.rootfi.core.inviteLinks.create({
      company_name: organizationName,
      integrations: [integrationName],
      integration_categories: [IntegrationCategory.Accounting]
    })
    return {
      company_id: inviteLinkObject.data.company.rootfi_id,
      link_token: `${ROOTFI_INVITE_LINK}${inviteLinkObject.data.invite_link_id}`,
      integration_name: integration
    }
  }

  async getRootfiOrgId(organizationId: string, integrationName: IntegrationName): Promise<number> {
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName,
        organizationId,
        platform: Platform.ROOTFI,
        relations: { organizationIntegrationAuth: true }
      })
    return organizationIntegration.organizationIntegrationAuth?.rootfiOrgId
  }

  async getCompanyInfo(organizationId: string, integrationName: IntegrationName): Promise<CompanyInfo> {
    // get rootfiOrgId within organizationIntegrationAuth, if it is not available then return null
    const rootfiOrgId = await this.getRootfiOrgId(organizationId, integrationName)
    if (!rootfiOrgId) return null
    const rootfiCompanyInfo = await this.rootfi.core.companies.get(rootfiOrgId)
    const companyTimeZoneAndCurrency = await this.getTimezoneAndCurrency(rootfiOrgId)
    return {
      id: rootfiCompanyInfo.data?.rootfi_id,
      ...(rootfiCompanyInfo.data?.connections
        ? {
            connection_status: rootfiCompanyInfo.data.connections[0]?.connection_status as ConnectionStatus,
            sync_status: rootfiCompanyInfo.data.connections[0]?.sync_status as SyncStatus
          }
        : {}),
      ...companyTimeZoneAndCurrency
    }
  }

  async getTimezoneAndCurrency(rootfiOrgId: number): Promise<CompanyTimeZoneAndCurrency> {
    const companyInfoResponse = await this.rootfi.accounting.companyInfo.list({
      rootfiCompanyIdEq: rootfiOrgId,
      select: 'raw_data'
    })
    if (companyInfoResponse.data.length === 0) return null
    const rawData = companyInfoResponse.data[0].raw_data
    const name = companyInfoResponse.data[0].name
    const currency = companyInfoResponse.data[0].base_currency
    const timezone = typeof rawData?.Timezone === 'string' ? rawData?.Timezone : null
    return {
      name,
      timezone,
      currency
    }
  }

  async getAccounts(
    organizationId: string,
    integrationName: IntegrationName,
    condition: GetAccountsCondition
  ): Promise<Account[]> {
    const rootfiOrgId = await this.getRootfiOrgId(organizationId, integrationName)
    if (!rootfiOrgId) return []

    if (condition && !condition.pageSize) {
      condition.pageSize = 100
    }

    const results: Account[] = []
    let response: GetAccountsResponse = null
    do {
      response = await this.rootfi.accounting.accounts.list({
        limit: condition.pageSize,
        next: condition.cursor,
        includeDeletedRecords: condition.includeDeletedData ? 'true' : 'false',
        rootfiCompanyIdEq: rootfiOrgId
      })
      response.data.filter((acc) => {
        results.push({
          id: `${acc.rootfi_id}`,
          remote_id: acc.platform_unique_id,
          name: acc.name,
          description: acc.description,
          type: acc.category as COAType,
          account_number: acc.nominal_code || '',
          current_balance: acc.current_balance,
          company: `${acc.rootfi_company_id}`,
          status: acc.status === 'ACTIVE' ? COASourceStatus.ACTIVE : COASourceStatus.INACTIVE,
          updated_at: new Date(acc.updated_at),
          raw_data: acc
        })
      })
      condition.cursor = response?.next
    } while (response?.next)
    return results
  }

  async postJournalEntries(
    journalEntry: JournalEntry,
    organizationId: string,
    integrationName: IntegrationName
  ): Promise<CreateJournalEntryResponse> {
    const rootfiOrgId = await this.getRootfiOrgId(organizationId, integrationName)
    if (!rootfiOrgId) return null
    // get fiat currency from settings
    const settings = await this.organizationSettingsEntityService.get(organizationId, {
      relations: { fiatCurrency: true }
    })
    if (![IntegrationName.XERO, IntegrationName.QUICKBOOKS].includes(integrationName)) {
      throw `invalid integrationName=${integrationName}`
    }
    if (!settings?.fiatCurrency) return null
    const currency = settings?.fiatCurrency.alphabeticCode
    const journalLines: JournalLinesFields[] = []

    // Note: The fields 'remote_id' (from Merge) and 'platform_unique_id' (from RootFi) are equal,
    // and we use them as a common field for our COA, which we call 'platform_id'.
    // The 'account_id' property name is misleading.
    // You might expect that it should be populated with 'remote_id' for both Xero and QuickBooks, but this is not the case.
    // - For Xero, 'account_id' should be populated with 'nominal_code' (account.code).
    // - For QuickBooks, 'account_id' should be populated with 'remote_id' (account.platform_id).
    for (const journalLine of journalEntry.journalLines) {
      journalLines.push({
        account_id:
          integrationName === IntegrationName.QUICKBOOKS ? journalLine.account?.platformId : journalLine.account?.code,
        net_amount: Math.abs(parseFloat(journalLine.netAmount)),
        description: journalLine.description,
        type: journalLine.entryType === JournalLineEntryType.DEBIT ? JournalLineType.Debit : JournalLineType.Credit
      })
    }
    // get narration if integration name is xero
    let narration = ''
    if (integrationName === IntegrationName.XERO) {
      narration = journalEntry.integrationParams['xero']?.narration
    }

    return await this.rootfi.accounting.journalEntries.create({
      company_id: rootfiOrgId,
      data: [
        {
          description: narration,
          currency_id: currency,
          journal_lines: journalLines,
          posted_date: journalEntry.transactionDate.toISOString(),
          raw_data: { Status: 'DRAFT' }
        }
      ] as any[] as JournalEntryFields[]
    })
  }

  async deleteLinkedAccount(rootfiOrgId?: number): Promise<boolean> {
    if (!rootfiOrgId) return false
    const response = await this.rootfi.core.companies.delete(rootfiOrgId)
    return response.status === 'success'
  }

  toCheckWhichKeyChanged(
    sourceAccount: accountingAccount,
    localAccount: ChartOfAccount,
    integrationName: IntegrationName
  ): string[] {
    const keysChangedAtSource: string[] = []
    if (sourceAccount.remote_id === localAccount.platformId) {
      if (integrationName === IntegrationName.XERO) {
        if (sourceAccount.account_number.trim() !== localAccount.code.trim()) {
          keysChangedAtSource.push('code')
        }
        if (sourceAccount.description?.trim() !== localAccount.description?.trim()) {
          keysChangedAtSource.push('description')
        }
      }
      if (sourceAccount.name?.trim() !== localAccount.name?.trim()) {
        keysChangedAtSource.push('name')
      }
      if (sourceAccount.type.trim() !== localAccount.type.trim()) {
        keysChangedAtSource.push('type')
      }
    }
    return keysChangedAtSource
  }

  async createSync(organizationId: string, integrationName: IntegrationName): Promise<RootFiSyncStatusResult> {
    const rootfiOrgId = await this.getRootfiOrgId(organizationId, integrationName)
    if (!rootfiOrgId) return null
    // get integration type
    const integrationType = this.getRootfiIntegrationType(integrationName)
    try {
      const newSyncResponse = await this.rootfi.core.syncs.create({
        company_id: rootfiOrgId,
        integration_type: integrationType,
        full_sync: true,
        data_models_to_sync: [DataModels.Accounts]
      })
      return {
        syncId: (newSyncResponse as any).data?.id || (newSyncResponse as any).id,
        status: this.getSyncStatus((newSyncResponse as any).data?.status || (newSyncResponse as any).status)
      }
    } catch (e: any) {
      if (e === INVALID_SYNC_STATUS || e === INVALID_INTEGRATION_NAME) {
        throw e
      }
      const error = e as RootFiError
      const { code } = (error.body as any)?.error
      if (code === SYNC_OPERATION_DENIED) {
        throw SYNC_OPERATION_DENIED
      }
      throw e
    }
  }

  async getSync(syncId: string): Promise<RootFiSyncStatusResult> {
    const syncResponse = await this.rootfi.core.syncs.get(syncId)
    const { status } = (syncResponse as any)?.data
    try {
      return { syncId, status: this.getSyncStatus(status.toLowerCase()) }
    } catch (e) {
      if (e === INVALID_SYNC_STATUS) {
        this.logger.debug('get sync data returns invalid sync status', { syncId, status })
        return null
      }
      throw e
    }
  }

  getRootfiIntegrationType(integrationName: IntegrationName): IntegrationType {
    switch (integrationName) {
      case IntegrationName.XERO:
        return IntegrationType.Xero
      case IntegrationName.QUICKBOOKS:
        return IntegrationType.Quickbooks
    }
    throw INVALID_INTEGRATION_NAME
  }

  getSyncStatus(status: string): RootFiSyncStatus {
    switch (status) {
      case 'created':
      case 'running':
        return RootFiSyncStatus.PROCESSING
      case 'failed':
        return RootFiSyncStatus.FAILED
      case 'success':
        return RootFiSyncStatus.SUCCESS
    }
    throw INVALID_SYNC_STATUS
  }
}
