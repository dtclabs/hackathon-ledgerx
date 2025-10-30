import { AccountToken } from '@mergeapi/merge-hris-node'
import { Accounting } from '@mergeapi/merge-sdk-typescript'
import { RemoteResponse } from '@mergeapi/merge-sdk-typescript/dist/accounting/models'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChartOfAccount } from '../../../../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { IntegrationName } from '../../../../shared/entity-services/integration/integration.entity'
import { OrganizationIntegrationStatus } from '../../../../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsEntityService } from '../../../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import {
  Account,
  MergeJournalEntryRequest,
  MergeJournalLine,
  QuickbooksPaths,
  RequestFormatENUM,
  XeroPaths
} from './interfaces'
import { MergeHrisAdapter } from './merge-hris.adapter'
import { MergeAdapter } from './merge.sdk.adapter'
import { CompanyInfo, LinkToken, Account as accountingAccount, COAType, COASourceStatus, Platform } from '../interfaces'
import { JournalEntry } from '../../../../shared/entity-services/journal-entries/journal-entry.entity'
@Injectable()
export class MergeService {
  constructor(
    private logger: LoggerService,
    private configService: ConfigService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService
  ) {}

  async getAccounts(
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
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<Account[]> {
    const mergeSDK = await this.initMergeAdapter(organizationId, integrationName, accountToken)
    return await mergeSDK.getAccounts(condition)
  }

  async passThrough(
    payload: {
      method: Accounting.MethodEnumValues
      requestFormat: RequestFormatENUM
      normalizeResponse?: boolean
    },
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<RemoteResponse> {
    let path: XeroPaths | QuickbooksPaths = null

    if (integrationName === IntegrationName.XERO) {
      path = XeroPaths.accounts
    } else if (integrationName === IntegrationName.QUICKBOOKS) {
      path = QuickbooksPaths.accounts
    }

    const mergeSDK = await this.initMergeAdapter(organizationId, integrationName, accountToken)
    return await mergeSDK.passThrough(
      payload.method,
      path,
      payload.requestFormat,
      integrationName,
      payload.normalizeResponse
    )
  }

  async postJournalEntries(
    journalEntry: JournalEntry,
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<Accounting.JournalEntryResponse> {
    const mergeJournalLines: MergeJournalLine[] = []
    for (const journalLine of journalEntry.journalLines) {
      mergeJournalLines.push({
        account: journalLine.account.remoteId,
        net_amount: parseFloat(journalLine.netAmount),
        description: journalLine.description
      })
    }
    const mergeJournalEntryRequest: MergeJournalEntryRequest = {
      transaction_date: journalEntry.transactionDate,
      memo: journalEntry.memo,
      lines: mergeJournalLines,
      integration_params: journalEntry.integrationParams.xero
    }
    const mergeSDK = await this.initMergeAdapter(organizationId, integrationName, accountToken)
    return await mergeSDK.postJournal(mergeJournalEntryRequest)
  }

  async getCompanyInfo(
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<CompanyInfo> {
    const mergeSDK = await this.initMergeAdapter(organizationId, integrationName, accountToken)
    const companyInfo = await mergeSDK.getCompanyInfo({ includeRemoteData: true })
    const remoteData: any = companyInfo.remote_data?.[0].data
    return {
      id: companyInfo.id,
      name: companyInfo.name,
      remote_id: companyInfo.remote_id,
      timezone: remoteData?.Timezone,
      currency: remoteData?.BaseCurrency
    }
  }

  async getAccountDetails(
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<Accounting.AccountDetails> {
    const mergeSDK = await this.initMergeAdapter(organizationId, integrationName, accountToken)
    return await mergeSDK.getAccountDetails()
  }

  async initMergeAdapter(
    organizationId: string,
    integrationName: IntegrationName,
    accountToken?: string
  ): Promise<MergeAdapter> {
    let organizationIntegrationAccountToken: string

    if (accountToken) {
      organizationIntegrationAccountToken = accountToken
    } else {
      const organizationIntegration =
        await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
          integrationName,
          organizationId,
          platform: Platform.MERGE,
          statuses: [OrganizationIntegrationStatus.TOKEN_SWAPPED, OrganizationIntegrationStatus.COMPLETED],
          relations: { organizationIntegrationAuth: true }
        })
      organizationIntegrationAccountToken = organizationIntegration.organizationIntegrationAuth.accessToken
    }

    return new MergeAdapter(organizationIntegrationAccountToken, this.configService, this.logger)
  }

  async getLinkToken(organizationName: string, organizationEmail: string, integration: string): Promise<LinkToken> {
    const mergeAdapter = new MergeHrisAdapter(this.configService, this.logger)
    const linkToken = await mergeAdapter.getLinkToken(organizationName, organizationEmail, integration)
    return {
      link_token: linkToken.link_token,
      integration_name: integration
    }
  }

  async getAccountToken(token: string): Promise<AccountToken> {
    const mergeAdapter = new MergeHrisAdapter(this.configService, this.logger)
    const accountToken = await mergeAdapter.getAccountToken(token)
    return accountToken
  }

  async deleteLinkedAccount(accountToken: string) {
    const mergeAdapter = new MergeHrisAdapter(this.configService, this.logger)
    const deleteAccountResult = await mergeAdapter.deleteLinkedAccount(accountToken)
    return deleteAccountResult
  }

  getMatchedAccounts(
    mergeAccounts: Account[],
    passThroughResponse: any,
    integrationName: IntegrationName
  ): accountingAccount[] {
    let passThroughAccounts = []
    let matchedAccounts = []

    if (integrationName === IntegrationName.XERO) {
      passThroughAccounts = passThroughResponse.response.Accounts.filter((acc) => acc.Code).map((acc) => ({
        ...acc,
        Id: acc.AccountID
      }))
    } else if (integrationName === IntegrationName.QUICKBOOKS) {
      passThroughAccounts = passThroughResponse.response.QueryResponse.Account
    }

    matchedAccounts = this.getRemoteIdMatchedAccounts(mergeAccounts, passThroughAccounts)

    return matchedAccounts
  }

  getRemoteIdMatchedAccounts(mergeAccounts: Account[], passThroughAccounts: any[]): accountingAccount[] {
    const mergeAccountsGroupedByRemoteId: { [remote_id: string]: Account } = {}
    const passThroughAccountsById: { [name: string]: any } = {}

    for (const mergeAccount of mergeAccounts) {
      if (mergeAccountsGroupedByRemoteId[mergeAccount.remote_id]) {
        if (mergeAccount.modified_at > mergeAccountsGroupedByRemoteId[mergeAccount.remote_id].modified_at) {
          mergeAccountsGroupedByRemoteId[mergeAccount.remote_id] = mergeAccount
        }
      } else {
        mergeAccountsGroupedByRemoteId[mergeAccount.remote_id] = mergeAccount
      }
    }
    for (const passThroughAccount of passThroughAccounts) {
      if (!passThroughAccountsById[passThroughAccount.Id]) {
        passThroughAccountsById[passThroughAccount.Id] = passThroughAccount
      }
    }

    const results: accountingAccount[] = []

    for (const [remoteId, account] of Object.entries(mergeAccountsGroupedByRemoteId)) {
      if (passThroughAccountsById[remoteId]) {
        results.push({
          id: account.id,
          remote_id: account.remote_id,
          name: account.name,
          description: account.description,
          type: account.classification.value as COAType,
          account_number: account.account_number,
          current_balance: account.current_balance,
          company: account.company,
          status: account.status.value as COASourceStatus,
          updated_at: account.modified_at,
          raw_data: account
        })
      }
    }

    return results
  }

  getCodeMatchedAccounts(mergeAccounts: Account[], passThroughAccounts: any[]): Account[] {
    const mergeAccountsGroupedByAccountNumber: { [account_number: string]: Account } = {}

    for (const mergeAccount of mergeAccounts) {
      if (mergeAccountsGroupedByAccountNumber[mergeAccount.account_number]) {
        if (mergeAccount.modified_at > mergeAccountsGroupedByAccountNumber[mergeAccount.account_number].modified_at) {
          mergeAccountsGroupedByAccountNumber[mergeAccount.account_number] = mergeAccount
        }
      } else {
        mergeAccountsGroupedByAccountNumber[mergeAccount.account_number] = mergeAccount
      }
    }

    const passThroughAccountsByCode: { [Code: string]: any } = {}

    for (const passThroughAccount of passThroughAccounts) {
      if (!passThroughAccountsByCode[passThroughAccount.Code]) {
        passThroughAccountsByCode[passThroughAccount.Code] = passThroughAccount
      }
    }

    const results: Account[] = []

    for (const [account_number, account] of Object.entries(mergeAccountsGroupedByAccountNumber)) {
      if (passThroughAccountsByCode[account_number]) {
        results.push(account)
      }
    }

    return results
  }

  toCheckWhichKeyChanged(f: accountingAccount, s: ChartOfAccount, integrationName: IntegrationName): string[] {
    const keysChangedAtSource: string[] = []
    if (f.id === s.remoteId) {
      switch (integrationName) {
        case IntegrationName.XERO:
          if (f.account_number.trim() !== s.code.trim()) {
            keysChangedAtSource.push('code')
          }
          if (integrationName === IntegrationName.XERO && f.name.trim() !== s.name.trim()) {
            keysChangedAtSource.push('name')
          }
          if (
            integrationName === IntegrationName.XERO &&
            f.description &&
            f.description.trim() !== s.description.trim()
          ) {
            keysChangedAtSource.push('description')
          }
          if (f.type.trim() !== s.type.trim()) {
            keysChangedAtSource.push('type')
          }
          break
        case IntegrationName.QUICKBOOKS:
          if (f.name.replace(/ \(deleted\)/g, '').trim() !== s.name.trim()) {
            keysChangedAtSource.push('name')
          }
          if (f.type.trim() !== s.type.trim()) {
            keysChangedAtSource.push('type')
          }
      }
    }
    return keysChangedAtSource
  }

  // For some reason, merge might return classification as null.
  sanitize(item: any, integrationName: IntegrationName) {
    const coaTypes = Object.keys(COAType)
    const isHaveTheseFields =
      item.name &&
      item.classification &&
      item.classification.value &&
      item.status &&
      item.status.value &&
      coaTypes.includes(item.classification.value)

    if (integrationName === IntegrationName.XERO) {
      return isHaveTheseFields && item.account_number
    } else if (integrationName === IntegrationName.QUICKBOOKS) {
      return isHaveTheseFields
    }
  }
}
