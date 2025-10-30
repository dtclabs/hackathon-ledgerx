import { Accounting, Configuration, MergePaginatedResponse } from '@mergeapi/merge-sdk-typescript'
import { CompanyInfoListRequest } from '@mergeapi/merge-sdk-typescript/dist/accounting'
import {
  Account,
  CompanyInfo,
  JournalEntryResponse,
  RemoteResponse
} from '@mergeapi/merge-sdk-typescript/dist/accounting/models'
import { ConfigService } from '@nestjs/config'
import fetch from 'node-fetch'
import { IntegrationName } from '../../../../shared/entity-services/integration/integration.entity'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { MergeJournalEntryRequest, QUICKBOOKS_MAX_PAGESIZE, RequestFormatENUM } from './interfaces'
export class MergeAdapter {
  apiKey: string

  constructor(
    private readonly accountToken: string,
    private readonly configService: ConfigService,
    private logger: LoggerService
  ) {
    this.apiKey = this.configService.get('MERGE_ACCESS_TOKEN')
  }

  async getAccounts(condition: {
    createdAfter?: Date
    createdBefore?: Date
    cursor?: string
    includeDeletedData?: boolean
    includeRemoteData?: boolean
    modifiedAfter?: Date
    modifiedBefore?: Date
    pageSize?: number
    remoteId?: string | null
  }): Promise<any[]> {
    const confAccounting = new Configuration({
      apiKey: this.apiKey,
      accessToken: this.accountToken,
      fetchApi: fetch
    })
    if (condition && !condition.pageSize) {
      condition.pageSize = 100
    }

    const accounts = new Accounting.AccountsApi(confAccounting)
    let results: Account[] = []
    let response: MergePaginatedResponse<Account> = null

    do {
      response = await accounts.accountsList(condition)
      results = [...results, ...response.results]
      condition.cursor = response?.next
    } while (response?.next)
    return results
  }

  async passThrough(
    method: Accounting.MethodEnumValues,
    path: string,
    requestFormat: RequestFormatENUM,
    integrationName: IntegrationName,
    normalizeResponse?: boolean
  ): Promise<RemoteResponse> {
    const confAccounting = new Configuration({
      apiKey: this.apiKey,
      accessToken: this.accountToken,
      fetchApi: fetch
    })
    const apiInstance = new Accounting.PassthroughApi(confAccounting)
    try {
      const dataPassthroughRequest = {
        method: { value: method, rawValue: method },
        path,
        requestFormat,
        headers: {
          Accept: 'application/json'
        }
      }
      if (normalizeResponse) dataPassthroughRequest['normalizeResponse'] = normalizeResponse

      let result: Accounting.RemoteResponse = null
      let accounts = []
      let startPosition = 1

      if (integrationName === IntegrationName.QUICKBOOKS) {
        do {
          result = await apiInstance.passthroughCreate({
            dataPassthroughRequest
          })
          dataPassthroughRequest.path = dataPassthroughRequest.path.replace(
            `STARTPOSITION ${startPosition}`,
            `STARTPOSITION ${startPosition + QUICKBOOKS_MAX_PAGESIZE}`
          )
          startPosition += QUICKBOOKS_MAX_PAGESIZE
          accounts = [...accounts, ...result.response.QueryResponse.Account]
        } while (result?.response?.QueryResponse?.maxResults === QUICKBOOKS_MAX_PAGESIZE)

        result.response.QueryResponse.Account = accounts
      } else if (integrationName === IntegrationName.XERO) {
        result = await apiInstance.passthroughCreate({
          dataPassthroughRequest
        })
      }
      return result
    } catch (error) {
      this.logger.error('getAccounts', error)
      throw error
    }
  }

  async postJournal(journalModel: MergeJournalEntryRequest): Promise<JournalEntryResponse> {
    const confAccounting = new Configuration({
      apiKey: this.apiKey,
      accessToken: this.accountToken,
      fetchApi: fetch
    })
    const journalEntryMerge = new Accounting.JournalEntriesApi(confAccounting)
    const journalResults = await journalEntryMerge.journalEntriesCreate({
      journalEntryEndpointRequest: { model: journalModel }
    })
    return journalResults
  }

  async getCompanyInfo(condition: CompanyInfoListRequest): Promise<CompanyInfo> {
    const confAccounting = new Configuration({
      apiKey: this.apiKey,
      accessToken: this.accountToken,
      fetchApi: fetch
    })
    const companyInfo = new Accounting.CompanyInfoApi(confAccounting)
    const response: MergePaginatedResponse<CompanyInfo> = await companyInfo.companyInfoList(condition)
    const result: CompanyInfo = response.results?.at(0) ?? null
    return result
  }

  async getAccountDetails(): Promise<Accounting.AccountDetails> {
    const confAccounting = new Configuration({
      apiKey: this.apiKey,
      accessToken: this.accountToken,
      fetchApi: fetch
    })

    const accountDetails = new Accounting.AccountDetailsApi(confAccounting)
    const response: Accounting.AccountDetails = await accountDetails.accountDetailsRetrieve()

    return response
  }
}
