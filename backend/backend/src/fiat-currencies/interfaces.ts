import { ApiProperty } from '@nestjs/swagger'
import { FiatCurrency } from '../shared/entity-services/fiat-currencies/fiat-currency.entity'

export class FiatCurrencyDetailedDto {
  @ApiProperty({ example: 'US Dollar' })
  name: string

  @ApiProperty({
    description: 'This is the unique id of the fiat currency. String specificed here will be uppercased.',
    example: 'USD'
  })
  code: string

  @ApiProperty({ example: '$' })
  symbol: string

  @ApiProperty({ example: 2 })
  decimal: number

  @ApiProperty({
    example: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/fiat-currency-images/SGD.svg'
  })
  image: string

  static map(fiatCurrency: FiatCurrency): FiatCurrencyDetailedDto {
    const result = new FiatCurrencyDetailedDto()
    result.name = fiatCurrency.name
    result.code = fiatCurrency.alphabeticCode
    result.symbol = fiatCurrency.symbol
    result.decimal = fiatCurrency.decimal
    result.image = fiatCurrency.image

    return result
  }
}
