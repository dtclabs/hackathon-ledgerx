import { HttpService } from '@nestjs/axios'
import { Injectable, NotImplementedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces'
import { AxiosResponse } from 'axios'
import { createHmac } from 'crypto'
import { lastValueFrom } from 'rxjs'
import {
  Currency,
  CurrencyCategory,
  GenerateMerchantQrResponse,
  HttpMethod,
  LoginResponse,
  QueryHistoryResponse,
  QueryPaymentDetailResponse
} from './interfaces'
import { LoggerService } from '../../../shared/logger/logger.service'

@Injectable()
export class DtcpayService {
  BASE_URL: string

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private loggerService: LoggerService
  ) {
    this.BASE_URL = this.configService.get('DTCPAY_BASE_URL')
  }

  async login(signKey: string, merchantId: number, terminalId: number): Promise<LoginResponse> {
    const relativeUrl = '/api/v1/sign-in'
    const config: AxiosRequestConfig = {}
    config.headers = this.generateAuthHeaders(HttpMethod.GET, relativeUrl, signKey, merchantId, terminalId)
    const response = await lastValueFrom<AxiosResponse>(this.httpService.get(this.BASE_URL + relativeUrl, config))
    this.loggerService.debug('dtcpay login response', JSON.stringify(response.data, null, 2))
    return response.data
  }

  async queryPaymentDetail(
    signKey: string,
    merchantId: number,
    terminalId: number,
    transactionId: number
  ): Promise<QueryPaymentDetailResponse> {
    const relativeUrl = '/api/v1/query-detail'

    const config: AxiosRequestConfig = {}
    const data = {
      transactionId: transactionId
    }
    config.headers = this.generateAuthHeaders(
      HttpMethod.POST,
      relativeUrl,
      signKey,
      merchantId,
      terminalId,
      JSON.stringify(data)
    )
    const response = await lastValueFrom<AxiosResponse>(
      this.httpService.post(this.BASE_URL + relativeUrl, data, config)
    )
    this.loggerService.debug('dtcpay query payment response', JSON.stringify(response.data, null, 2))
    return response.data
  }

  async queryHistory(
    signKey: string,
    merchantId: number,
    terminalId: number,
    pageSize: number,
    pageNo: number
  ): Promise<QueryHistoryResponse> {
    const relativeUrl = '/api/v1/query-history'

    const config: AxiosRequestConfig = {}
    const data = {
      pageSize: pageSize,
      pageNo: pageNo
    }
    config.headers = this.generateAuthHeaders(
      HttpMethod.POST,
      relativeUrl,
      signKey,
      merchantId,
      terminalId,
      JSON.stringify(data)
    )
    const response = await lastValueFrom<AxiosResponse>(
      this.httpService.post(this.BASE_URL + relativeUrl, data, config)
    )
    this.loggerService.debug('dtcpay query history response', JSON.stringify(response.data, null, 2))
    return response.data
  }

  async generateMerchantQr(
    signKey: string,
    merchantId: number,
    terminalId: number,
    acqRouteId: number,
    totalAmount: string,
    referenceNo: string
  ): Promise<GenerateMerchantQrResponse> {
    const relativeUrl = '/api/v1/generate-merchant-qr'
    const config: AxiosRequestConfig = {}
    const data = {
      transaction: {
        acqRouteId: acqRouteId,
        totalAmount: totalAmount,
        referenceNo: referenceNo
      }
    }
    config.headers = this.generateAuthHeaders(
      HttpMethod.POST,
      relativeUrl,
      signKey,
      merchantId,
      terminalId,
      JSON.stringify(data)
    )
    const response = await lastValueFrom<AxiosResponse>(
      this.httpService.post(this.BASE_URL + relativeUrl, data, config)
    )
    this.loggerService.debug('dtcpay generate QR response', JSON.stringify(response.data, null, 2))
    return response.data
  }

  getCurrencyCategory(currency: Currency): CurrencyCategory {
    switch (currency) {
      case Currency.AUD:
      case Currency.CNY:
      case Currency.EUR:
      case Currency.HKD:
      case Currency.JPY:
      case Currency.SGD:
      case Currency.USD:
      case Currency.GBP:
        return CurrencyCategory.FIAT
      case Currency.USDT:
      case Currency.BTC:
      case Currency.ETH:
      case Currency.TRX:
      case Currency.USDC:
        return CurrencyCategory.CRYPTO
      default:
        throw new NotImplementedException(`Currency not found: ${currency}`)
    }
  }

  // See https://app.clickup.com/t/865d2u79p for signature generation steps
  private generateAuthHeaders(
    httpMethod: HttpMethod,
    relativeUrl: string,
    signKey: string,
    merchantId: number,
    terminalId: number,
    requestBody?: string
  ) {
    const timestampInMs: number = Date.now()
    // Define your secret key and data
    const data = `${httpMethod}${timestampInMs}${relativeUrl}${requestBody ?? ''}`
    const hmac = createHmac('sha512', signKey)
    hmac.update(data)
    return {
      'D-MERCHANT-ID': merchantId,
      'D-TERMINAL-ID': terminalId,
      'D-TIMESTAMP': timestampInMs,
      'D-SIGNATURE': hmac.digest('base64')
    }
  }
}
