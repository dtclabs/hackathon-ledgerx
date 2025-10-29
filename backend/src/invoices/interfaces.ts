import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  CounterpartyMetadata,
  DtcpaySourceMetadata,
  InvoiceDetails,
  InvoiceItem,
  InvoiceMetadata,
  InvoiceRole,
  InvoiceSettlementStatus,
  InvoiceSource,
  InvoiceStatus,
  TaxDetails
} from '../shared/entity-services/invoices/interfaces'
import { Invoice } from '../shared/entity-services/invoices/invoice.entity'
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import { PaginationParams } from '../core/interfaces'
import { Blockchain } from '../shared/entity-services/blockchains/blockchain.entity'
import { Cryptocurrency, CryptocurrencyImage } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { DeepPartial } from 'typeorm'

export class TaxDetailsDto {
  @ApiProperty({ required: true })
  @Min(0)
  @Max(100)
  @IsNumber()
  @IsNotEmpty()
  percentage?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  amount?: string

  static map(taxDetails: TaxDetails): TaxDetailsDto {
    const dto = new TaxDetailsDto()
    dto.percentage = taxDetails.percentage
    dto.amount = taxDetails.amount

    return dto
  }
}

export class InvoiceItemDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string

  @ApiProperty({ required: true, description: 'Currency from Request Finance. https://api.request.finance/currency' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  currency: string

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  quantity: number

  @ApiProperty({ required: true })
  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TaxDetailsDto)
  tax?: TaxDetailsDto

  static map(invoiceItem: InvoiceItem): InvoiceItemDto {
    const dto = new InvoiceItemDto()
    dto.name = invoiceItem.name
    dto.currency = invoiceItem.currency
    dto.quantity = invoiceItem.quantity
    dto.amount = invoiceItem.amount
    dto.tax = invoiceItem.tax

    return dto
  }
}

export class InvoiceDetailsDto {
  @ApiProperty({ required: true })
  @IsNumberString()
  @IsNotEmpty()
  subtotal: string

  @ApiProperty({ required: true })
  @IsNumberString()
  @IsNotEmpty()
  taxTotal: string

  @ApiProperty({ required: true, isArray: true, type: InvoiceItemDto })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[]

  static map(invoiceDetails: InvoiceDetails): InvoiceDetailsDto {
    const dto = new InvoiceDetailsDto()
    dto.subtotal = invoiceDetails.subtotal
    dto.taxTotal = invoiceDetails.taxTotal
    dto.items = invoiceDetails.items.map((item) => InvoiceItemDto.map(item))

    return dto
  }
}

export class InvoiceMetadataDto {
  @ApiProperty()
  note: string

  @ApiProperty({ isArray: true })
  tags: string[]

  @ApiProperty()
  @IsEnum(InvoiceSettlementStatus)
  settlementStatus: InvoiceSettlementStatus

  static map(invoiceMetadata: InvoiceMetadata): InvoiceMetadataDto {
    const dto = new InvoiceMetadataDto()
    dto.note = invoiceMetadata.note
    dto.tags = invoiceMetadata.tags
    dto.settlementStatus = invoiceMetadata.settlementStatus

    return dto
  }
}

export class InvoiceContactDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address: string

  static map(counterpartyMetadata: CounterpartyMetadata): InvoiceContactDto {
    const dto = new InvoiceContactDto()
    dto.name = counterpartyMetadata?.name
    dto.email = counterpartyMetadata?.email
    dto.address = counterpartyMetadata?.address

    return dto
  }
}

export class BlockchainDto {
  @ApiProperty({ example: 'ethereum' })
  id: string

  @ApiProperty({
    description: 'Full name of the chain for display purpose',
    example: 'Ethereum Mainnet'
  })
  name: string

  @ApiProperty({
    example: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png'
  })
  imageUrl: string

  static map(blockchain: Blockchain): BlockchainDto {
    const result = new BlockchainDto()
    result.id = blockchain.publicId
    result.name = blockchain.name
    result.imageUrl = blockchain.imageUrl ?? null

    return result
  }
}

export class CryptocurrencyDto {
  @ApiProperty({ example: 'USD Coin' })
  name: string

  @ApiProperty({ example: 'USDC' })
  symbol: string

  @ApiProperty({
    example: {
      thumb:
        'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/USDC_usd-coin_7eb722d7-e986-405e-a01c-b018bc710593_thumb.png',
      small:
        'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/USDC_usd-coin_7eb722d7-e986-405e-a01c-b018bc710593_small.png',
      large:
        'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/USDC_usd-coin_7eb722d7-e986-405e-a01c-b018bc710593_large.png'
    }
  })
  @IsNotEmpty()
  image: CryptocurrencyImage

  static map(cryptocurrency: DeepPartial<Cryptocurrency>): CryptocurrencyDto {
    const result = new CryptocurrencyDto()
    result.name = cryptocurrency.name
    result.symbol = cryptocurrency.symbol
    result.image = cryptocurrency.image
    return result
  }
}

export class ChannelDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  blockchain: BlockchainDto

  @ApiProperty()
  cryptocurrency: CryptocurrencyDto

  static map(channel: { id: number; blockchain: Blockchain; cryptocurrency: DeepPartial<Cryptocurrency> }): ChannelDto {
    const dto = new ChannelDto()
    dto.id = channel.id
    dto.blockchain = BlockchainDto.map(channel.blockchain)
    dto.cryptocurrency = CryptocurrencyDto.map(channel.cryptocurrency)
    return dto
  }
}

export class SourceMetadataDto {
  @ApiProperty()
  qr: string

  @ApiProperty()
  amount: string

  @ApiProperty()
  blockchain: string

  @ApiProperty()
  cryptocurrency: string

  @ApiProperty()
  exchangeRate: string

  @ApiProperty()
  expiry: Date

  @ApiProperty()
  paidAt?: Date

  @ApiProperty()
  transactionHash?: string

  @ApiProperty({ isArray: true })
  channels: ChannelDto[]

  static map(
    sourceMetadata: DtcpaySourceMetadata,
    channels?: { id: number; blockchain: Blockchain; cryptocurrency: DeepPartial<Cryptocurrency> }[]
  ): SourceMetadataDto {
    const dto = new SourceMetadataDto()
    dto.qr = sourceMetadata?.qr
    dto.amount = sourceMetadata?.amount
    dto.blockchain = sourceMetadata?.blockchain
    dto.cryptocurrency = sourceMetadata?.cryptocurrency
    dto.exchangeRate = sourceMetadata?.exchangeRate
    dto.expiry = sourceMetadata?.expiry
    dto.paidAt = sourceMetadata?.paidAt
    dto.transactionHash = sourceMetadata?.transactionHash
    dto.channels = channels?.map((channel) => ChannelDto.map(channel))
    return dto
  }
}

export class InvoiceDto {
  @ApiProperty()
  id: string

  @ApiProperty({ enum: InvoiceSource })
  source: InvoiceSource

  @ApiProperty()
  sourceMetadata: SourceMetadataDto

  @ApiProperty()
  invoiceNumber: string

  @ApiProperty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus

  @ApiProperty()
  fromMetadata: InvoiceContactDto

  @ApiProperty()
  toMetadata: InvoiceContactDto

  @ApiProperty({ description: 'Currency from Request Finance. https://api.request.finance/currency' })
  currency: string

  @ApiProperty()
  totalAmount: string

  @ApiProperty()
  invoiceDetails: InvoiceDetailsDto

  @ApiProperty({ enum: InvoiceRole })
  role: InvoiceRole

  @ApiProperty()
  viewUrl: string

  @ApiProperty()
  issuedAt: Date

  @ApiProperty()
  expiredAt: Date

  @ApiProperty({ type: InvoiceMetadataDto })
  metadata: InvoiceMetadataDto

  static map(invoice: Invoice): InvoiceDto {
    const dto = new InvoiceDto()
    dto.id = invoice.publicId
    dto.status = invoice.status
    dto.source = invoice.source
    dto.sourceMetadata = SourceMetadataDto.map(invoice.sourceMetadata)
    dto.invoiceNumber = invoice.invoiceNumber
    dto.fromMetadata = InvoiceContactDto.map(invoice.fromMetadata)
    dto.toMetadata = InvoiceContactDto.map(invoice.toMetadata)
    dto.invoiceDetails = InvoiceDetailsDto.map(invoice.invoiceDetails)
    dto.currency = invoice.currency
    dto.totalAmount = invoice.totalAmount
    dto.role = invoice.role
    dto.viewUrl = invoice.viewUrl
    dto.issuedAt = invoice.issuedAt
    dto.expiredAt = invoice.expiredAt
    dto.metadata = InvoiceMetadataDto.map(invoice.metadata)

    return dto
  }
}

export class InvoicePublicDto {
  @ApiProperty()
  id: string

  @ApiProperty({ enum: InvoiceSource })
  source: InvoiceSource

  @ApiProperty()
  sourceMetadata: SourceMetadataDto

  @ApiProperty()
  invoiceNumber: string

  @ApiProperty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus

  @ApiProperty()
  fromMetadata: InvoiceContactDto

  @ApiProperty()
  toMetadata: InvoiceContactDto

  @ApiProperty({ description: 'Currency from Request Finance. https://api.request.finance/currency' })
  currency: string

  @ApiProperty()
  totalAmount: string

  @ApiProperty()
  invoiceDetails: InvoiceDetailsDto

  @ApiProperty()
  issuedAt: Date

  @ApiProperty()
  expiredAt: Date

  @ApiProperty({ type: InvoiceMetadataDto })
  metadata: InvoiceMetadataDto

  static map(
    invoice: Invoice,
    channels?: { id: number; blockchain: Blockchain; cryptocurrency: DeepPartial<Cryptocurrency> }[]
  ): InvoicePublicDto {
    const dto = new InvoicePublicDto()
    dto.id = invoice.publicId
    dto.status = invoice.status
    dto.source = invoice.source
    dto.sourceMetadata = SourceMetadataDto.map(invoice.sourceMetadata, channels)
    dto.invoiceNumber = invoice.invoiceNumber
    dto.fromMetadata = InvoiceContactDto.map(invoice.fromMetadata)
    dto.toMetadata = InvoiceContactDto.map(invoice.toMetadata)
    dto.invoiceDetails = InvoiceDetailsDto.map(invoice.invoiceDetails)
    dto.currency = invoice.currency
    dto.totalAmount = invoice.totalAmount
    dto.issuedAt = invoice.issuedAt
    dto.expiredAt = invoice.expiredAt
    dto.metadata = InvoiceMetadataDto.map(invoice.metadata)

    return dto
  }
}

export class InvoicesQueryParams extends PaginationParams {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(InvoiceSource)
  source: InvoiceSource

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issuedAt: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiredAt: Date
}

export class CreateInvoiceDto {
  @IsEnum(InvoiceSource)
  @ApiProperty({ required: true })
  source: InvoiceSource

  @IsNotEmpty()
  @ApiProperty({ required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  invoiceNumber: string

  @IsNotEmpty()
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => InvoiceContactDto)
  fromMetadata: InvoiceContactDto

  @IsNotEmpty()
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => InvoiceContactDto)
  toMetadata: InvoiceContactDto

  @ApiPropertyOptional()
  @ValidateIf((obj) => {
    return obj.source !== InvoiceSource.DTCPAY
  })
  @IsNotEmpty()
  @IsString()
  currency: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumberString()
  totalAmount: string

  @IsNotEmpty()
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => InvoiceDetailsDto)
  invoiceDetails: InvoiceDetailsDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issuedAt: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiredAt: Date

  @ApiPropertyOptional()
  note: string
}

export class GenerateQrDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  id: number
}
