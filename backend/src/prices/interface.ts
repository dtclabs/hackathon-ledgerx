import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class GetPricesQueryParams {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  cryptocurrencyId: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fiatCurrency: string

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @ApiProperty()
  date: Date
}
