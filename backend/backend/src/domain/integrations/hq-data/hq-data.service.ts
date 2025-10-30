import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../../../shared/logger/logger.service'

@Injectable()
export class HqDataService {
  protected BASE_URL: string

  constructor(
    protected configService: ConfigService,
    protected httpService: HttpService,
    protected logger: LoggerService
  ) {
    this.BASE_URL = this.configService.get('HQ_DATA_SERVICE_URL') + `/v1`
  }
}
