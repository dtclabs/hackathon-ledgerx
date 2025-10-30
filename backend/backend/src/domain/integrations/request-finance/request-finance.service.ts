import { HttpService } from '@nestjs/axios'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces'
import { AxiosResponse } from 'axios'
import { lastValueFrom } from 'rxjs'
import { IntegrationName } from '../../../shared/entity-services/integration/integration.entity'
import { OrganizationIntegrationsEntityService } from '../../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { RequestFinanceInvoiceStatus } from '../../../shared/entity-services/request-finance-invoices/interfaces'
import { RequestFinanceInvoice } from '../../../shared/entity-services/request-finance-invoices/request-finance-invoice.entity'
import { RequestFinanceInvoicesEntityService } from '../../../shared/entity-services/request-finance-invoices/request-finance-invoices.entity-service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import {
  GetAccessTokenFromCodeRequest,
  GetAccessTokenFromCodeResponse,
  GetAccessTokenFromRefreshTokenRequest,
  GetAccessTokenFromRefreshTokenResponse,
  RequestFinanceCurrencyResponse,
  RequestFinanceInvoiceResponse
} from './interfaces'
import { OrganizationIntegrationStatus } from '../../../shared/entity-services/organization-integrations/interfaces'
@Injectable()
export class RequestFinanceService {
  private REQUEST_FINANCE_CLIENT_ID: string
  private REQUEST_FINANCE_CLIENT_SECRET: string
  private REQUEST_FINANCE_OAUTH_TOKEN_URL = 'https://auth.request.finance/oauth/token'
  private REQUEST_FINANCE_CURRENCY_MAP: Map<string, RequestFinanceCurrencyResponse> = new Map<
    string,
    RequestFinanceCurrencyResponse
  >()

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private logger: LoggerService,
    private requestFinanceInvoicesEntityService: RequestFinanceInvoicesEntityService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService
  ) {
    this.REQUEST_FINANCE_CLIENT_ID = this.configService.get('REQUEST_FINANCE_CLIENT_ID')
    this.REQUEST_FINANCE_CLIENT_SECRET = this.configService.get('REQUEST_FINANCE_CLIENT_SECRET')
  }

  async getAccessTokenFromCode(code: string, redirect_uri: string): Promise<GetAccessTokenFromCodeResponse> {
    const requestBody: GetAccessTokenFromCodeRequest = {
      grant_type: 'authorization_code',
      client_id: this.REQUEST_FINANCE_CLIENT_ID,
      client_secret: this.REQUEST_FINANCE_CLIENT_SECRET,
      code,
      redirect_uri
    }

    const response = await lastValueFrom<AxiosResponse<GetAccessTokenFromCodeResponse>>(
      this.httpService.post(this.REQUEST_FINANCE_OAUTH_TOKEN_URL, requestBody)
    )

    return response.data
  }

  async getAccessTokenFromRefreshToken(refresh_token: string): Promise<GetAccessTokenFromRefreshTokenResponse> {
    const requestBody: GetAccessTokenFromRefreshTokenRequest = {
      grant_type: 'refresh_token',
      client_id: this.REQUEST_FINANCE_CLIENT_ID,
      client_secret: this.REQUEST_FINANCE_CLIENT_SECRET,
      refresh_token
    }

    const response = await lastValueFrom<AxiosResponse<GetAccessTokenFromRefreshTokenResponse>>(
      this.httpService.post(this.REQUEST_FINANCE_OAUTH_TOKEN_URL, requestBody)
    )

    return response.data
  }

  async getRequestConfigByOrganization(organizationId: string): Promise<AxiosRequestConfig> {
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: IntegrationName.REQUEST_FINANCE,
        organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED],
        relations: { organizationIntegrationAuth: true }
      })

    if (!organizationIntegration) {
      this.logger.error('getRequestConfigByOrganization error', { organizationId })
      throw new UnauthorizedException(
        'There is a problem with Request Finance Authorization. If this issue persists, please contact our team.'
      )
    }

    const auth = organizationIntegration.organizationIntegrationAuth
    let accessToken = auth.accessToken

    if (dateHelper.getUTCTimestamp() > auth.expiredAt) {
      const response = await this.getAccessTokenFromRefreshToken(auth.refreshToken)

      const expiredAt = dateHelper.getUTCTimestampSecondsForward(response.expires_in - 1000)

      await this.organizationIntegrationsEntityService.updateAuthById(auth.id, {
        accessToken: response.access_token,
        expiredAt
      })

      accessToken = response.access_token
    }

    const config: AxiosRequestConfig = {}
    config.headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Network': 'live',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    return config
  }

  async syncNewForOrganization(organizationId: string): Promise<RequestFinanceInvoice[]> {
    const config = await this.getRequestConfigByOrganization(organizationId)

    const requestInvoice = await this.requestFinanceInvoicesEntityService.getLatestInvoiceByOrganization(organizationId)

    let creationDateRange = null
    if (requestInvoice) {
      creationDateRange = `{"from":"${requestInvoice.creationDate.toISOString()}"}`
    }

    // https://docs.request.finance/invoices#listing-invoices
    let listInvoicesUrl = `https://api.request.finance/invoices?withLinks=true`
    if (creationDateRange) {
      listInvoicesUrl = listInvoicesUrl + `&creationDateRange=${creationDateRange}`
    }

    const response = await lastValueFrom<AxiosResponse<RequestFinanceInvoiceResponse[]>>(
      this.httpService.get(listInvoicesUrl, config)
    )

    let requestFinanceInvoices: RequestFinanceInvoice[] = []
    try {
      if (response.data && response.data.length) {
        requestFinanceInvoices = await this.requestFinanceInvoicesEntityService.upsertByOrganization(
          organizationId,
          response.data
        )
      }
    } catch (e) {
      this.logger.error('RequestFinance upsertByOrganization error', { organizationId }, e)
    }

    return requestFinanceInvoices
  }

  // Return only paid invoices
  async syncNonTerminalStateForOrganization(organizationId: string): Promise<RequestFinanceInvoice[]> {
    const config = await this.getRequestConfigByOrganization(organizationId)

    const paidInvoices: RequestFinanceInvoice[] = []

    const nonTerminalStateRequestInvoices =
      await this.requestFinanceInvoicesEntityService.getNonTerminalStateInvoicesByOrganization(organizationId)

    for (const nonTerminalStateRequestInvoice of nonTerminalStateRequestInvoices) {
      // https://docs.request.finance/invoices#fetch-an-invoice-by-its-id
      let getInvoiceUrl = `https://api.request.finance/invoices/${nonTerminalStateRequestInvoice.requestId}?withLinks=true`

      try {
        const response = await lastValueFrom<AxiosResponse<RequestFinanceInvoiceResponse>>(
          this.httpService.get(getInvoiceUrl, config)
        )

        if (response.data && response.data.status !== nonTerminalStateRequestInvoice.status) {
          const newInvoice = await this.requestFinanceInvoicesEntityService.updateByObjectAndRawData(
            nonTerminalStateRequestInvoice,
            response.data
          )

          if (newInvoice.status === RequestFinanceInvoiceStatus.PAID) {
            paidInvoices.push(newInvoice)
          }
        }
      } catch (e) {
        this.logger.error('RequestFinance syncNonTerminalStateForOrganization error', { organizationId }, e)
      }

      return paidInvoices
    }
  }

  async refreshFromSource(organizationId: string, sourceId: string): Promise<RequestFinanceInvoice> {
    const config = await this.getRequestConfigByOrganization(organizationId)

    try {
      const existingRequestFinanceInvoice =
        await this.requestFinanceInvoicesEntityService.getByOrganizationAndRequestIdAndHash(organizationId, sourceId)

      let getInvoiceUrl = `https://api.request.finance/invoices/${existingRequestFinanceInvoice.requestId}?withLinks=true`

      const response = await lastValueFrom<AxiosResponse<RequestFinanceInvoiceResponse>>(
        this.httpService.get(getInvoiceUrl, config)
      )

      const newInvoice = await this.requestFinanceInvoicesEntityService.updateByObjectAndRawData(
        existingRequestFinanceInvoice,
        response.data
      )

      return newInvoice
    } catch (e) {
      this.logger.error('RequestFinance checkForUpdate error', { organizationId }, e)
    }
  }

  async getSymbolAndDecimalFromRequestCurrency(
    currencyIdString: string
  ): Promise<{ symbol: string; decimals: number }> {
    if (this.REQUEST_FINANCE_CURRENCY_MAP.size === 0) {
      const getCurrencyUrl = 'https://api.request.finance/currency'

      const response = await lastValueFrom<AxiosResponse<RequestFinanceCurrencyResponse[]>>(
        this.httpService.get(getCurrencyUrl)
      )

      for (const currencyResponse of response.data) {
        this.REQUEST_FINANCE_CURRENCY_MAP.set(currencyResponse.id, currencyResponse)
      }
    }

    return this.REQUEST_FINANCE_CURRENCY_MAP.get(currencyIdString)
  }
}
