import { Controller, Get, Query } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetPricesQueryParams } from './interface'
import { PricesService } from './prices.service'

@ApiTags('prices')
@Controller('prices')
export class PricesController {
  constructor(private pricesService: PricesService) {}

  @Get('')
  @ApiResponse({ status: 200 })
  async getPrices(@Query() query: GetPricesQueryParams) {
    return await this.pricesService.getFiatPriceByPublicIds({
      cryptocurrencyPublicId: query.cryptocurrencyId,
      fiatCurrencyAlphabeticCode: query.fiatCurrency,
      date: query.date
    })
  }
}
