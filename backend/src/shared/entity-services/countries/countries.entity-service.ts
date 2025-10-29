import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Country } from './country.entity'

@Injectable()
export class CountriesEntityService extends BaseEntityService<Country> {
  constructor(
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>
  ) {
    super(countriesRepository)
  }

  async getDefault() {
    return this.countriesRepository.findOne({
      where: {
        iso3: 'SGP'
      }
    })
  }
}
