import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { lastValueFrom } from 'rxjs'
import { toChecksumAddress } from 'web3-utils'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../../../shared/entity-services/feature-flags/interfaces'
import { LoggerService } from '../../../shared/logger/logger.service'
import { HqDataService } from './hq-data.service'
import { HqDataApiResponse, HqDataJob, HqDataNft, HqDataNftCollection, HqDataPrice } from './interfaces'

@Injectable()
export class HqDataNftService extends HqDataService {
  private BASE_URL_WITH_NAMESPACE: string
  private DEFAULT_ITEMS_PER_PAGE: number

  constructor(
    configService: ConfigService,
    httpService: HttpService,
    loggerService: LoggerService,
    protected featureFlagsEntityService: FeatureFlagsEntityService
  ) {
    super(configService, httpService, loggerService)
    this.BASE_URL_WITH_NAMESPACE = this.BASE_URL + `/nft`
    this.DEFAULT_ITEMS_PER_PAGE = 50
  }

  async startAddressSync(address: string): Promise<HqDataJob> {
    let relativeUrl = `/jobs`
    const data = {
      address: toChecksumAddress(address)
    }

    const url = this.BASE_URL_WITH_NAMESPACE + relativeUrl

    try {
      const response = await lastValueFrom<AxiosResponse<HqDataApiResponse<HqDataJob>>>(
        this.httpService.post(url, data)
      )
      return response?.data?.data
    } catch (e) {
      const message = `Hq-data-nft service startAddressSync error - ${url} - ${e?.message} - ${e?.stack} - ${e?.response?.data}`
      this.logger.error(message, JSON.stringify(e?.request?.path))
      throw new Error(message)
    }
  }

  async getAddressSyncById(syncId: string): Promise<HqDataJob> {
    let relativeUrl = `/jobs/${syncId}`

    const url = this.BASE_URL_WITH_NAMESPACE + relativeUrl

    try {
      const response = await lastValueFrom<AxiosResponse<HqDataApiResponse<HqDataJob>>>(this.httpService.get(url))
      return response?.data?.data
    } catch (e) {
      const message = `Hq-data-nft service getAddressSyncById error - ${url} - ${e?.response?.data}`
      this.logger.error(message, JSON.stringify(e?.request?.path))
      throw new Error(message)
    }
  }

  async getNftsByAddress(params: {
    address: string
    pageNumber?: number
    itemsPerPage?: number
    updateAfter?: Date
  }): Promise<HqDataNft[]> {
    let relativeUrl = `/nfts?address=${toChecksumAddress(params.address)}`
    relativeUrl += `&itemsPerPage=${this.DEFAULT_ITEMS_PER_PAGE}`

    if (params.pageNumber) {
      relativeUrl += `&page=${params.pageNumber}`
    }

    if (params.updateAfter) {
      const ignoreUpdateFlag = await this.featureFlagsEntityService.isFeatureEnabled(
        FeatureFlagOption.NFT_GET_IGNORE_UPDATE_AFTER
      )
      if (!ignoreUpdateFlag) {
        // TODO: Clean the db implementation of updateAfter here because it is parsed as string by typeorm now if it is inside a json.
        relativeUrl += `&updateAfter=${new Date(params.updateAfter).getTime()}`
      }
    }

    const url = this.BASE_URL_WITH_NAMESPACE + relativeUrl

    try {
      const response = await lastValueFrom<AxiosResponse<HqDataApiResponse<HqDataNft[]>>>(this.httpService.get(url))
      return response?.data?.data
    } catch (e) {
      const message = `Hq-data-nft service getNftsByAddress error - ${url} - ${e?.response?.data}`
      this.logger.error(message, JSON.stringify(e?.request?.path))
      throw new Error(message)
    }
  }

  async getNftCollectionsBySourceId(sourceId: string): Promise<HqDataNftCollection[]> {
    let relativeUrl = `/collections`
    relativeUrl += `?ids=${sourceId}`

    const url = this.BASE_URL_WITH_NAMESPACE + relativeUrl

    try {
      const response = await lastValueFrom<AxiosResponse<HqDataApiResponse<HqDataNftCollection[]>>>(
        this.httpService.get(url)
      )
      return response?.data?.data
    } catch (e) {
      const message = `Hq-data-nft service getNftCollectionPricesByCollectionIds error - ${e?.response?.data}`
      this.logger.error(message, JSON.stringify(e?.request?.path))
      throw new Error(message)
    }
  }

  async getNftCollectionPricesByCollectionIds(collectionIds: string[]): Promise<HqDataPrice[]> {
    let relativeUrl = `/collection_floor_prices`

    let pathUrl = ''
    for (const collectionId of collectionIds) {
      if (pathUrl === '') {
        pathUrl += `?collectionIds=${collectionId}`
      } else {
        pathUrl += `&collectionIds=${collectionId}`
      }
    }

    const url = this.BASE_URL_WITH_NAMESPACE + relativeUrl + pathUrl

    try {
      const response = await lastValueFrom<AxiosResponse<HqDataApiResponse<HqDataPrice[]>>>(this.httpService.get(url))
      return response?.data?.data
    } catch (e) {
      const message = `Hq-data-nft service getNftCollectionPricesByCollectionIds error - ${e?.response?.data}`
      this.logger.error(message, JSON.stringify(e?.request?.path))
      throw new Error(message)
    }
  }
}
