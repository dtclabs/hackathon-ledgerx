import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { AxiosResponse } from 'axios'
import { LoggerService } from '../../../shared/logger/logger.service'
import { HttpService } from '@nestjs/axios'
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces'
import { BlockpassResponse } from './interfaces'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class BlockpassService {
  private BASE_URL: string
  private CLIENT_ID: string
  private API_KEY: string
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService
  ) {
    this.BASE_URL = this.configService.get('BLOCKPASS_BASE_URL')
    this.CLIENT_ID = this.configService.get('BLOCKPASS_CLIENT_ID')
    this.API_KEY = this.configService.get('BLOCKPASS_API_KEY')
  }

  async getBlockpassStatusByRefId(referenceId: string): Promise<BlockpassResponse> {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: this.API_KEY,
        'cache-control': 'no-cache'
      }
    }
    const relativeUrl = `/${this.CLIENT_ID}/refId/${referenceId}`

    try {
      const response = await lastValueFrom<AxiosResponse<BlockpassResponse>>(
        this.httpService.get(this.BASE_URL + relativeUrl, config)
      )

      this.loggerService.debug('Blockpass response', JSON.stringify(response.data))
      return response.data
    } catch (e) {
      this.loggerService.error('Blockpass error', e.message, e.response?.data, referenceId)
      throw e
    }
  }
}
