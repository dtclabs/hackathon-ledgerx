import { BadRequestException } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsUUID, isUUID } from 'class-validator'
import { ChartOfAccountDto } from '../chart-of-accounts/inferfaces'
import { NULL_API_STRING } from '../shared/constants'
import { ChartOfAccountMapping } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mapping.entity'
import { ChartOfAccountMappingType } from '../shared/entity-services/chart-of-account-mapping/interfaces'
import { FinancialTransactionChildMetadataDirection } from '../shared/entity-services/financial-transactions/interfaces'

export class ChartOfAccountMappingDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  id: string

  @ApiProperty({ enum: ChartOfAccountMappingType })
  type: ChartOfAccountMappingType

  @ApiProperty()
  chartOfAccount: ChartOfAccountDto

  @ApiProperty({ nullable: true })
  walletId: string

  @ApiProperty({ nullable: true })
  cryptocurrencyId: string

  @ApiProperty({ nullable: true })
  recipientId: string

  @ApiProperty({ nullable: true, enum: FinancialTransactionChildMetadataDirection })
  direction: string

  static map(chartOfAccountMapping: ChartOfAccountMapping): ChartOfAccountMappingDto {
    const result = new ChartOfAccountMappingDto()
    result.id = chartOfAccountMapping.publicId
    result.type = chartOfAccountMapping.type
    result.chartOfAccount = chartOfAccountMapping.chartOfAccount
      ? ChartOfAccountDto.map(chartOfAccountMapping.chartOfAccount)
      : null
    result.walletId = chartOfAccountMapping.wallet?.publicId ?? null
    result.cryptocurrencyId = chartOfAccountMapping.cryptocurrency?.publicId ?? null
    result.recipientId = chartOfAccountMapping.recipient?.publicId ?? null
    result.direction = chartOfAccountMapping.direction ?? null

    return result
  }
}

export class ChartOfAccountMappingQueryParams {
  @IsOptional()
  @IsEnum(ChartOfAccountMappingType)
  @ApiProperty({
    enum: ChartOfAccountMappingType,
    required: false
  })
  type?: ChartOfAccountMappingType

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiProperty({
    isArray: true,
    example: ['9c8f7b01-777f-4a0f-9841-5d7d7e844442', '54a2621d-cbaa-4500-b91a-fb21b5070422'],
    required: false
  })
  walletIds?: string[]

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ApiPropertyOptional({
    isArray: true,
    example: [NULL_API_STRING, 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  chartOfAccountIds?: string[]
}

export class CreateChartOfAccountMappingDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ required: true })
  chartOfAccountId: string

  @IsNotEmpty()
  @IsEnum([ChartOfAccountMappingType.WALLET])
  @ApiProperty({
    required: true,
    enum: [ChartOfAccountMappingType.WALLET]
  })
  type: ChartOfAccountMappingType

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: 'Wallet id + cryptocurrency id need to be together'
  })
  walletId: string

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: 'Wallet id + cryptocurrency id need to be together'
  })
  cryptocurrencyId: string
}

export class UpdateChartOfAccountMappingDto {
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (isUUID(value) || value === NULL_API_STRING) {
      return value
    }
    throw new BadRequestException('chartOfAccountId should be UUID or null string')
  })
  @ApiProperty({
    required: true,
    description: 'Either UUID or null string',
    example: '12da843e-b60e-40d3-b676-1d6fc962dc76'
  })
  chartOfAccountId: string

  @ApiProperty({
    required: false,
    description: 'Whether to overwrite previously set mapping by the user or not',
    example: false,
    default: false
  })
  toOverwriteManualData: boolean = true
}
