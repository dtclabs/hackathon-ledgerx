import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { ToBoolean } from '../../shared/decorators/transformers/transformers'

export class PublicCryptocurrenciesQueryParams {
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  @ApiProperty({ example: true, type: Boolean })
  isVerified: boolean
}
