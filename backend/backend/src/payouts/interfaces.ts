import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { LineItem, PayoutStatus, PayoutType } from '../shared/entity-services/payouts/interfaces'
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { Payout } from '../shared/entity-services/payouts/payout.entity'
import { Type } from 'class-transformer'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'

export class CreateLineItemDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  address: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  cryptocurrencyId: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumberString()
  amount: string

  @ApiPropertyOptional()
  chartOfAccountId: string

  @ApiPropertyOptional()
  notes: string

  @ApiPropertyOptional()
  files: string[]
}

export class CreatePayoutDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  blockchainId: string

  @ApiProperty({ required: true })
  @IsEnum(PayoutType)
  type: PayoutType

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID()
  sourceWalletId: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => {
    return obj.type === PayoutType.DISPERSE
  })
  @IsNotEmpty()
  @IsString()
  hash: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => {
    return obj.type === PayoutType.SAFE
  })
  @IsNotEmpty()
  @IsString()
  safeHash: string

  @ApiPropertyOptional()
  notes: string

  @ApiProperty({ isArray: true })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateLineItemDto)
  lineItems: CreateLineItemDto[]

  @ApiPropertyOptional()
  metadata: {
    method?: any
    metamaskTransaction?: any
    safeTransaction?: any
  }
}

export class LineItemDto {
  @ApiProperty()
  address: string

  @ApiProperty()
  cryptocurrencyId: string

  @ApiProperty()
  amount: string

  @ApiProperty()
  chartOfAccountId: string

  @ApiProperty()
  notes: string

  @ApiProperty()
  files: string[]

  static map(lineItem: LineItem): LineItemDto {
    const dto = new LineItemDto()
    dto.address = lineItem.address
    dto.cryptocurrencyId = lineItem.cryptocurrencyId
    dto.amount = lineItem.amount
    dto.chartOfAccountId = lineItem.chartOfAccountId
    dto.notes = lineItem.notes
    dto.files = lineItem.files
    return dto
  }
}

export class WalletDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  address: string

  static map(wallet: Wallet): WalletDto {
    const dto = new WalletDto()
    dto.name = wallet.name
    dto.address = wallet.address
    return dto
  }
}

export class PayoutDto {
  @ApiProperty()
  blockchainId: string

  @ApiProperty()
  @IsEnum(PayoutStatus)
  status: PayoutStatus

  @ApiProperty()
  @IsEnum(PayoutType)
  type: PayoutType

  @ApiProperty()
  sourceWallet: WalletDto

  @ApiProperty()
  sourceAddress: string

  @ApiProperty()
  hash: string

  @ApiProperty()
  safeHash: string

  @ApiProperty()
  notes: string

  @ApiProperty({ isArray: true })
  lineItems: LineItemDto[]

  @ApiProperty()
  executedAt: Date

  @ApiProperty()
  executedBy: string

  @ApiProperty()
  metadata: {
    method?: any
    metamaskTransaction?: any
    safeTransaction?: any
  }

  static map(payout: Payout): PayoutDto {
    const dto = new PayoutDto()
    dto.blockchainId = payout.blockchainId
    dto.status = payout.status
    dto.type = payout.type
    dto.sourceWallet = WalletDto.map(payout.sourceWallet)
    dto.hash = payout.hash
    dto.safeHash = payout.safeHash
    dto.notes = payout.notes
    dto.metadata = payout.metadata
    dto.executedAt = payout.executedAt
    dto.executedBy = `${payout.executedBy.firstName} ${payout.executedBy.lastName}`.trim()
    dto.lineItems = payout.lineItems.map((lineItem) => LineItemDto.map(lineItem))
    return dto
  }
}
