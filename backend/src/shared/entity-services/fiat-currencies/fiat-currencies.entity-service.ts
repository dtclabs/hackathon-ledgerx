import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { FiatCurrency } from './fiat-currency.entity'

@Injectable()
export class FiatCurrenciesEntityService extends BaseEntityService<FiatCurrency> {
  constructor(
    @InjectRepository(FiatCurrency)
    private fiatCurrencyRepository: Repository<FiatCurrency>
  ) {
    super(fiatCurrencyRepository)
  }

  async getByAlphabeticCode(alphabeticCode: string): Promise<FiatCurrency> {
    return await this.fiatCurrencyRepository.findOne({
      where: {
        alphabeticCode: alphabeticCode.toUpperCase()
      }
    })
  }

  async getByAlphabeticCodes(alphabeticCodes: string[]): Promise<FiatCurrency[]> {
    return await this.fiatCurrencyRepository.find({
      where: {
        alphabeticCode: In(alphabeticCodes.map((code) => code.toUpperCase()))
      }
    })
  }

  async getDefault() {
    return this.getByAlphabeticCode('USD')
  }

  async getByIds(ids: string[], relations?: FindOptionsRelations<FiatCurrency>) {
    return await this.find({
      where: {
        id: In(ids)
      },
      relations
    })
  }
}
