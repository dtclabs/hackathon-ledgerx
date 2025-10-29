import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { FiatCurrenciesEntityService } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity-service'
import { FiatCurrencyDetailedDto } from './interfaces'

@ApiTags('fiat-currencies')
@Controller()
export class FiatCurrenciesController {
  constructor(private fiatCurrenciesService: FiatCurrenciesEntityService) {}

  @Get()
  @ApiResponse({ status: 200, type: FiatCurrencyDetailedDto, isArray: true })
  async getAll() {
    const fiatCurrencies = await this.fiatCurrenciesService.find({
      order: {
        name: 'ASC'
      }
    })

    return fiatCurrencies.map((fiatCurrency) => FiatCurrencyDetailedDto.map(fiatCurrency))
  }

  @Get(':code')
  @ApiResponse({ status: 200, type: FiatCurrencyDetailedDto, isArray: true })
  async getByCode(@Param('code') code: string) {
    const fiatCurrency = await this.fiatCurrenciesService.getByAlphabeticCode(code)

    if (fiatCurrency) {
      return FiatCurrencyDetailedDto.map(fiatCurrency)
    }

    throw new NotFoundException()
  }
}
