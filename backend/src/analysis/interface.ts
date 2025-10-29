import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateAnalysisDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  event: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referrer?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userAgent: string

  @ApiProperty()
  @IsNotEmpty()
  payload: any
}

export class AnalysisQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ip: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referrer: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  event: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional()
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional()
  size?: number

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  order?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  direction?: string
}

export class CreateAnalysisEventTrackerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  eventType: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  browser: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  device: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  organizationId?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  accountId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  traceId?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  referrerUrl?: string

  @ApiProperty()
  @IsOptional()
  metadata?: any
}

export class CreateAnalysisCreateTransactionDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  organizationId?: string

  @ApiProperty()
  @IsOptional()
  fromWalletId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fromAddress?: string

  @ApiPropertyOptional()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @IsDate()
  valueAt: Date

  @ApiProperty()
  @IsOptional()
  @IsString()
  hash: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cryptocurrencyId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  totalAmount: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalRecipient?: number

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  blockchainId: string

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  applicationName: string

  @ApiProperty()
  @IsOptional()
  recipients?: any

  @ApiProperty()
  @IsOptional()
  categories?: any

  @ApiProperty()
  @IsOptional()
  correspondingChartOfAccounts?: any

  @ApiProperty()
  @IsOptional()
  notes?: any

  @ApiProperty()
  @IsOptional()
  attachments?: any
}

export class CreateAnalysisCreatePayoutDto {
  @ApiPropertyOptional()
  blockchainId: string

  @ApiPropertyOptional()
  organizationId: string

  @ApiPropertyOptional()
  applicationName: string

  @ApiPropertyOptional()
  type: string

  @ApiPropertyOptional()
  sourceType: string

  @ApiPropertyOptional()
  sourceAddress: string

  @ApiPropertyOptional()
  sourceWalletId: string

  @ApiPropertyOptional()
  hash: string

  @ApiPropertyOptional()
  notes: string

  @ApiPropertyOptional()
  totalLineItems: number

  @ApiPropertyOptional()
  lineItems: any

  @ApiPropertyOptional()
  totalAmount: string

  @ApiProperty({ required: true })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  valueAt: Date
}
