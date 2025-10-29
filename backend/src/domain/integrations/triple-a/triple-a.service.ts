import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { isBefore } from 'date-fns'
import { AxiosResponse } from 'axios'
import { lastValueFrom } from 'rxjs'
import { LoggerService } from '../../../shared/logger/logger.service'
import { HttpService } from '@nestjs/axios'
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces'
import {
  TripleABankResponse,
  TripleACreateCompanyRequest,
  TripleACompanyResponse,
  TripleACreateIndividualRequest,
  TripleAIndividualResponse,
  TripleADestinationAccountResponse,
  TripleAOAuthResponse,
  TripleARole,
  TripleACreateDestinationAccountRequest,
  TripleADestinationAccountType,
  TripleACreateQuoteRequest,
  TripleATransferMode,
  TripleAFeeMode,
  TripleAQuoteResponse,
  TripleATransferResponse,
  TripleACreateTransferRequest,
  TripleASourceOfFunds,
  TripleARelationship,
  TripleARequiredFieldsResponse,
  TripleAConfirmTransferRequest,
  TripleAPaymentMethod
} from './interfaces'
import * as qs from 'qs'

@Injectable()
export class TripleAService {
  private BASE_URL: string
  private CLIENT_ID: string
  private CLIENT_SECRET: string
  private ACCESS_TOKEN: string
  private ACCESS_TOKEN_EXPIRY: Date

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService
  ) {
    this.BASE_URL = this.configService.get('TRIPLE_A_BASE_URL')
    this.CLIENT_ID = this.configService.get('TRIPLE_A_CLIENT_ID')
    this.CLIENT_SECRET = this.configService.get('TRIPLE_A_CLIENT_SECRET')
  }

  async listBanks(params?: {
    id?: string
    countryCode?: string
    name?: string
    page?: number
    size?: number
  }): Promise<TripleABankResponse[]> {
    // Return empty array if service is disabled
    if (this.CLIENT_ID === 'disabled' || this.CLIENT_SECRET === 'disabled') {
      this.loggerService.debug('TripleA service is disabled - returning empty banks list')
      return []
    }

    const relativeUrl = '/banks'
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders(),
      params: {
        id: params?.id,
        name: params?.name,
        country_code: params?.countryCode,
        page: params?.page,
        per_page: params?.size
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'brackets' })
      }
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleABankResponse[]>>(
        this.httpService.get(this.BASE_URL + relativeUrl, config)
      )

      this.loggerService.debug('Triple A list banks response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A list banks error', e.message, e.response?.data, params)
      throw e
    }
  }

  async listRequiredFields(countryCode: string): Promise<TripleARequiredFieldsResponse> {
    // Return empty object if service is disabled
    if (this.CLIENT_ID === 'disabled' || this.CLIENT_SECRET === 'disabled') {
      this.loggerService.debug('TripleA service is disabled - returning empty required fields')
      return {}
    }

    const relativeUrl = `/required-fields`
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders(),
      params: {
        country_code: countryCode,
        type: 'bank_account'
      }
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleARequiredFieldsResponse>>(
        this.httpService.get(this.BASE_URL + relativeUrl, config)
      )

      this.loggerService.debug('Triple A list required fields response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A list required fields error', e.message, e.response?.data, {
        countryCode: countryCode
      })
      throw e
    }
  }

  async createIndividual(params: TripleACreateIndividualRequest): Promise<TripleAIndividualResponse> {
    const relativeUrl = '/individuals'
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }
    const data = {
      external_id: params.externalId,
      gender: params.gender,
      last_name: params.lastName,
      first_name: params.firstName,
      email: params.email,
      country_code: params.countryCode,
      province_state: params.provinceState,
      city: params.city,
      address: params.address,
      zip_code: params.zipCode,
      date_of_birth: params.dateOfBirth,
      mobile_number: params.mobileNumber,
      identification_type: params.identificationType,
      identification_number: params.identificationNumber,
      identification_issuer: params.identificationIssuer,
      identification_issue_date: params.identificationIssueDate,
      identification_expiry_date: params.identificationExpiryDate,
      nationality: params.nationality,
      occupation: params.occupation,
      remarks: params.remarks,
      role: params.role ?? TripleARole.RECIPIENT
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleAIndividualResponse>>(
        this.httpService.post(this.BASE_URL + relativeUrl, data, config)
      )

      this.loggerService.debug('Triple A create individual response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A create individual error', e.message, e.response?.data, params)
      throw e
    }
  }

  async getIndividual(individualId: string): Promise<TripleAIndividualResponse> {
    const relativeUrl = `/individuals/${individualId}`
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleAIndividualResponse>>(
        this.httpService.get(this.BASE_URL + relativeUrl, config)
      )

      this.loggerService.debug('Triple A get individual response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A get individual error', e.message, e.response?.data, {
        individualId: individualId
      })
      throw e
    }
  }

  async createCompany(params: TripleACreateCompanyRequest): Promise<TripleACompanyResponse> {
    const relativeUrl = '/companies'
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }
    const data = {
      external_id: params.externalId,
      registered_name: params.registeredName,
      trading_name: params.tradingName,
      registration_type: params.registrationType,
      registration_number: params.registrationNumber,
      registration_date: params.registrationDate,
      registration_expiry_date: params.registrationExpiryDate,
      registration_country: params.registrationCountry,
      email: params.email,
      phone_number: params.phoneNumber,
      address: params.address,
      country_code: params.countryCode,
      zip_code: params.zipCode,
      city: params.city,
      province_state: params.provinceState,
      mobile_number: params.mobileNumber,
      remarks: params.remarks,
      role: TripleARole.RECIPIENT,
      business_nature: params.businessNature
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleACompanyResponse>>(
        this.httpService.post(this.BASE_URL + relativeUrl, data, config)
      )

      this.loggerService.debug('Triple A create company response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A create company error', e.message, e.response?.data, params)
      throw e
    }
  }

  async getCompany(companyId: string): Promise<TripleACompanyResponse> {
    const relativeUrl = `/companies/${companyId}`
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleACompanyResponse>>(
        this.httpService.get(this.BASE_URL + relativeUrl, config)
      )

      this.loggerService.debug('Triple A get company response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A get company error', e.message, e.response?.data, { companyId: companyId })
      throw e
    }
  }

  async createDestinationAccount(
    params: TripleACreateDestinationAccountRequest
  ): Promise<TripleADestinationAccountResponse> {
    const relativeUrl = '/destination-accounts'
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }
    const data = {
      type: params.type ?? TripleADestinationAccountType.BANK_ACCOUNT,
      owner_id: params.ownerId,
      external_id: params.externalId,
      receiving_institution_id: params.receivingInstitutionId,
      currency: params.currency,
      country_code: params.countryCode,
      alias: params.alias,
      account: {
        cashpoint: params.account.cashpoint,
        recipient_name: params.account.recipientName,
        recipient_identification_type: params.account.recipientIdentificationType,
        recipient_identification_number: params.account.recipientIdentificationNumber,
        recipient_nationality: params.account.recipientNationality,
        recipient_address: params.account.recipientAddress,
        recipient_province_state: params.account.recipientProvinceState,
        recipient_city: params.account.recipientCity,
        recipient_email: params.account.recipientEmail,
        recipient_date_of_birth: params.account.recipientDateOfBirth,
        recipient_identification_issuer: params.account.recipientIdentificationIssuer,
        recipient_identification_issue_date: params.account.recipientIdentificationIssueDate,
        recipient_identification_expiry_date: params.account.recipientIdentificationExpiryDate,
        recipient_gender: params.account.recipientGender,
        recipient_zip_code: params.account.recipientZipCode,
        mobile_number: params.account.mobileNumber,
        account_name: params.account.accountName,
        account_number: params.account.accountNumber,
        account_type: params.account.accountType,
        bank_account_type: params.account.bankAccountType,
        routing_type: params.account.routingType,
        routing_code: params.account.routingCode,
        branch_code: params.account.branchCode,
        bank_name: params.account.bankName
      }
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleADestinationAccountResponse>>(
        this.httpService.post(this.BASE_URL + relativeUrl, data, config)
      )

      this.loggerService.debug('Triple A create destination account response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A create destination account error', e.message, e.response?.data, params)
      throw e
    }
  }

  async getDestinationAccount(accountId: string): Promise<TripleADestinationAccountResponse> {
    const relativeUrl = `/destination-accounts/${accountId}`
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleADestinationAccountResponse>>(
        this.httpService.get(this.BASE_URL + relativeUrl, config)
      )

      this.loggerService.debug('Triple A get destination account response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A get destination account error', e.message, e.response?.data, {
        accountId: accountId
      })
      throw e
    }
  }

  async createQuote(params: TripleACreateQuoteRequest): Promise<TripleAQuoteResponse> {
    const relativeUrl = '/quotes'
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }
    let data: {
      mode: TripleATransferMode
      fee_mode?: TripleAFeeMode
      source_country: string
      destination_account_type: TripleADestinationAccountType
      destination_country: string
      sending_amount?: number
      sending_currency: string
      receiving_amount?: number
      receiving_currency: string
      me_to_me_transfer: boolean
    }

    switch (params.mode) {
      case TripleATransferMode.SENDING:
        data = {
          mode: params.mode,
          fee_mode: params.feeMode ?? TripleAFeeMode.EXCLUDED,
          source_country: params.sourceCountry,
          destination_account_type: params.destinationAccountType ?? TripleADestinationAccountType.BANK_ACCOUNT,
          destination_country: params.destinationCountry,
          sending_amount: params.sendingAmount,
          sending_currency: params.sendingCurrency,
          receiving_currency: params.receivingCurrency,
          me_to_me_transfer: params.meToMeTransfer ?? false
        }

        if (!data.sending_amount) {
          throw Error('sendingAmount required')
        }
        break
      default:
        data = {
          mode: params.mode ?? TripleATransferMode.RECEIVING,
          source_country: params.sourceCountry,
          destination_account_type: params.destinationAccountType ?? TripleADestinationAccountType.BANK_ACCOUNT,
          destination_country: params.destinationCountry,
          sending_currency: params.sendingCurrency,
          receiving_amount: params.receivingAmount,
          receiving_currency: params.receivingCurrency,
          me_to_me_transfer: params.meToMeTransfer ?? false
        }

        if (!data.receiving_amount) {
          throw Error('receivingAmount required')
        }
        break
    }

    try {
      const response = await lastValueFrom<AxiosResponse<TripleAQuoteResponse>>(
        this.httpService.post(this.BASE_URL + relativeUrl, data, config)
      )

      this.loggerService.debug('Triple A create quote response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A create quote error', e.message, e.response?.data, params)
      throw e
    }
  }

  async createTransferWithQuote(
    quoteId: string,
    params: TripleACreateTransferRequest
  ): Promise<TripleATransferResponse> {
    const relativeUrl = `/quotes/${quoteId}/transfers`
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }
    const data = {
      external_id: params.externalId,
      sender_id: params.senderId,
      recipient_id: params.recipientId,
      destination_account_id: params.destinationAccountId,
      purpose_of_remittance: params.purposeOfRemittance,
      source_of_funds: params.sourceOfFunds ?? TripleASourceOfFunds.OTHER,
      relationship: params.relationship ?? TripleARelationship.OTHER,
      remarks: params.remarks
    }
    try {
      const response = await lastValueFrom<AxiosResponse<TripleATransferResponse>>(
        this.httpService.post(this.BASE_URL + relativeUrl, data, config)
      )

      this.loggerService.debug('Triple A create transfer response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A create transfer error', e.message, e.response?.data, params)
      throw e
    }
  }

  async confirmTransfer(transferId: string, params?: TripleAConfirmTransferRequest): Promise<TripleATransferResponse> {
    const relativeUrl = `/transfers/${transferId}/confirm`
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }
    const data = {
      payment_method: params?.paymentMethod ?? TripleAPaymentMethod.PREFUNDING,
      success_url: params?.successUrl,
      cancel_url: params?.cancelUrl,
      amount_to_pay: params?.amountToPay,
      cryptocurrency: params?.cryptocurrency,
      card_id: params?.cardId
    }
    try {
      const response = await lastValueFrom<AxiosResponse<TripleATransferResponse>>(
        this.httpService.post(this.BASE_URL + relativeUrl, data, config)
      )

      this.loggerService.debug('Triple A confirm transfer response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A confirm transfer error', e.message, e.response?.data, params)
      throw e
    }
  }

  async getTransfer(transferId: string): Promise<TripleATransferResponse> {
    const relativeUrl = `/transfers/${transferId}`
    const config: AxiosRequestConfig = {
      headers: await this.buildHeaders()
    }
    try {
      const response = await lastValueFrom<AxiosResponse<TripleATransferResponse>>(
        this.httpService.get(this.BASE_URL + relativeUrl, config)
      )

      this.loggerService.debug('Triple A get transfer response', JSON.stringify(response.data, null, 2))

      return response.data
    } catch (e) {
      this.loggerService.error('Triple A get transfer error', e.message, e.response?.data, { transferId: transferId })
      throw e
    }
  }

  private async buildHeaders(headers?: { [key: string | symbol]: any }) {
    return {
      Authorization: `Bearer ${await this.getAccessToken()}`,
      ...headers
    }
  }

  private async getAccessToken() {
    // Skip authentication if TripleA is disabled (configuration values are 'disabled')
    if (this.CLIENT_ID === 'disabled' || this.CLIENT_SECRET === 'disabled' || !this.BASE_URL) {
      this.loggerService.debug('TripleA service is disabled - skipping OAuth authentication')
      return 'disabled'
    }

    if (!this.ACCESS_TOKEN || !this.ACCESS_TOKEN_EXPIRY || isBefore(this.ACCESS_TOKEN_EXPIRY, new Date())) {
      const relativeUrl = '/oauth/token'
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      const data = new URLSearchParams({
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        grant_type: 'client_credentials'
      })

      try {
        const response = await lastValueFrom<AxiosResponse<TripleAOAuthResponse>>(
          this.httpService.post(this.BASE_URL + relativeUrl, data, config)
        )

        this.loggerService.debug('Triple A OAuth response', JSON.stringify(response.data, null, 2))

        this.ACCESS_TOKEN = response.data.access_token
        this.ACCESS_TOKEN_EXPIRY = dateHelper.getUTCTimestampForward({
          // Token is valid for 1 hour
          // Refresh 5m before expiry
          seconds: response.data.expires_in - 300
        })
      } catch (e) {
        this.loggerService.error('Triple A OAuth error', e.message, e.response?.data)
        throw e
      }
    }

    return this.ACCESS_TOKEN
  }
}
