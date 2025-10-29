import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Timezone } from './timezone.entity'

@Injectable()
export class TimezonesEntityService extends BaseEntityService<Timezone> {
  constructor(
    @InjectRepository(Timezone)
    private timezoneRepository: Repository<Timezone>
  ) {
    super(timezoneRepository)
  }

  async getDefault() {
    return this.timezoneRepository.findOne({
      where: {
        abbrev: 'MPST'
      }
    })
  }

  // NOTE: This method is only used for sync timezones from xero
  async getByXeroTimezone(timezone: string) {
    if (!timezone) return null
    return this.timezoneRepository.findOne({ where: { xeroTimezone: timezone } })
  }
}
