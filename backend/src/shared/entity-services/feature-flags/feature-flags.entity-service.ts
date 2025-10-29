import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { dateHelper } from '../../helpers/date.helper'
import { LoggerService } from '../../logger/logger.service'
import { BaseEntityService } from '../base.entity-service'
import { FeatureFlag } from './feature-flag.entity'
import { EnvironmentEnum, FeatureFlagOption } from './interfaces'

@Injectable()
export class FeatureFlagsEntityService extends BaseEntityService<FeatureFlag> {
  private LAST_LOGGER_TIMESTAMP_GET_TIME: number
  private readonly MINUTE_OFFSET: number

  constructor(
    @InjectRepository(FeatureFlag)
    private featureFlagsRepository: Repository<FeatureFlag>,
    private logger: LoggerService,
    private configService: ConfigService
  ) {
    super(featureFlagsRepository)
    this.LAST_LOGGER_TIMESTAMP_GET_TIME = 0
    this.MINUTE_OFFSET = 60 * 1000
  }

  async isFeatureEnabled(name: FeatureFlagOption): Promise<boolean> {
    const flag = await this.featureFlagsRepository.findOne({
      where: { name: name, isEnabled: true, organizationId: IsNull() },
      cache: 10000
    })

    const isEnabled = !!flag

    const tempDate = dateHelper.getUTCTimestamp()
    if (tempDate.getTime() - this.LAST_LOGGER_TIMESTAMP_GET_TIME > 5 * this.MINUTE_OFFSET) {
      this.logger.info(`FEATURE FLAG = '${name}' is '${isEnabled ? 'enabled' : 'NOT enabled'}' `)
      this.LAST_LOGGER_TIMESTAMP_GET_TIME = tempDate.getTime()
    }

    return isEnabled
  }

  isProduction(): boolean {
    return this.configService.get('DEPLOYMENT_ENV') === EnvironmentEnum.PRODUCTION
  }

  async isFeatureWhitelisted(organizationId: string, name: FeatureFlagOption): Promise<boolean> {
    const whereCondition = { name: name, isEnabled: true, organizationId }
    const flag = await this.featureFlagsRepository.findOne({ where: whereCondition, cache: 10000 })
    return !!flag
  }
}
