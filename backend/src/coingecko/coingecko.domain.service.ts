import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { addDays, format } from 'date-fns'
import { lastValueFrom, map } from 'rxjs'
import { CoingeckoApiUrl } from '../shared/constants'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { CoinInfoResponse, HistoricalPriceResponse } from './interface'

@Injectable()
export class CoingeckoDomainService {
  public static readonly COINGECKO_DATE_FORMAT = 'dd-MM-yyyy'
  private INVALID_TOKEN_CACHE: Set<string>
  apiKey: string

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private blockchainsService: BlockchainsEntityService,
    private logger: LoggerService
  ) {
    this.apiKey = this.configService.get('COINGECKO_API_KEY')
    this.INVALID_TOKEN_CACHE = new Set<string>()
  }

  async getHistoryPriceGroupedByFiatSymbol(coingeckoTokenId: string, date: Date): Promise<{ [key: string]: number }> {
    try {
      // The API for a given date will return the opening price. We want to use closing price in our platform, hence day+1.
      // This is because the closing price of day x is always the opening price of day x+1.
      // In the case that it is today's date, just use the current price first.
      if (!dateHelper.isToday(date)) {
        date = addDays(date, 1)
      }
      const formattedQueryDate = format(date, CoingeckoDomainService.COINGECKO_DATE_FORMAT)
      const url = `${CoingeckoApiUrl}/coins/${coingeckoTokenId}/history?date=${formattedQueryDate}&x_cg_pro_api_key=${this.apiKey}`
      const priceResponse = await lastValueFrom<AxiosResponse<HistoricalPriceResponse>>(this.httpService.get(url))
      if (priceResponse && priceResponse.data && priceResponse.data.market_data) {
        return priceResponse.data.market_data.current_price
      } else {
        this.logger.debug(
          `No price history for '${coingeckoTokenId}' on query date '${formattedQueryDate}' at '${new Date().toLocaleString()}'`
        )
      }
      return null
    } catch (error) {
      if (error?.response?.status === 429) {
        this.logger.warning(`Coingecko rate limit exceeded`, {
          coingeckoTokenId,
          date,
          statusText: error?.response?.statusText,
          status: error?.response?.status
        })
      } else if (error?.response?.status >= 500 && error?.response?.status < 600) {
        this.logger.warning(`Coingecko service unavailable with code status ${error?.response?.status}`, {
          coingeckoTokenId,
          date,
          statusText: error?.response?.statusText,
          status: error?.response?.status,
          error
        })
      } else {
        this.logger.error(`Can not get history price from coingecko for token ${coingeckoTokenId}`, error, {
          coingeckoTokenId,
          date,
          statusText: error?.response?.statusText,
          status: error?.response?.status
        })
      }

      return null
    }
  }

  async getCoinInfoFromContractAddressHistory(params: { contractAddress: string; blockchainId: string }): Promise<{
    coinInfoResponse: CoinInfoResponse
    decimal: number
  }> {
    const assetPlatform = (await this.blockchainsService.getByPublicId(params.blockchainId))?.coingeckoAssetPlatformId
    if (!assetPlatform) {
      return
    }

    try {
      if (!this.INVALID_TOKEN_CACHE.has(params.contractAddress)) {
        const url = `${CoingeckoApiUrl}/coins/${assetPlatform}/contract/${params.contractAddress}?x_cg_pro_api_key=${this.apiKey}`
        const coinInfo = await lastValueFrom<AxiosResponse<CoinInfoResponse>>(this.httpService.get(url))

        //TODO: logs or throw error if not found
        if (coinInfo && coinInfo.status === 200 && coinInfo.data) {
          if (!coinInfo.data.detail_platforms[assetPlatform]?.decimal_place) {
            throw new Error('Decimal place needs to exist for the platform')
          }
          return {
            coinInfoResponse: coinInfo.data,
            decimal: coinInfo.data.detail_platforms[assetPlatform].decimal_place
          }
        }
      }
    } catch (error) {
      this.logger.info(
        `Can not get coin info from coingecko for contract address ${params.contractAddress} on ${assetPlatform}`
      )
      this.INVALID_TOKEN_CACHE.add(params.contractAddress)
      return
    }
  }

  async getCoinInfoFromCoinId(coingeckoId: string) {
    const url = `${CoingeckoApiUrl}/coins/${coingeckoId}?x_cg_pro_api_key=${this.apiKey}`
    const coinInfo = await lastValueFrom<AxiosResponse<CoinInfoResponse>>(this.httpService.get(url))

    //TODO: logs or throw error if not found
    if (coinInfo && coinInfo.status === 200 && coinInfo.data) {
      return coinInfo.data
    }
  }

  getSimplePrice(ids: string, vs_currencies: string) {
    return this.httpService
      .get(`${CoingeckoApiUrl}/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&x_cg_pro_api_key=${this.apiKey}`)
      .pipe(map((res) => res.data))
  }

  getCoinsHistory(id: string, date: string) {
    return this.httpService
      .get(`${CoingeckoApiUrl}/coins/${id}/history?date=${date}&x_cg_pro_api_key=${this.apiKey}`)
      .pipe(map((res) => res.data))
  }
}
