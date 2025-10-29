import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Validate } from 'class-validator'
import Decimal from 'decimal.js'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { TaxLotStatus } from '../shared/entity-services/gains-losses/interfaces'
import { TaxLot } from '../shared/entity-services/gains-losses/tax-lot.entity'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { PaginationParams } from '../core/interfaces'
import { CryptocurrencyResponseDto } from '../cryptocurrencies/interfaces'
import { WalletDto } from '../wallets/interfaces'
import { BalanceGroupByFieldEnum } from '../balances/types'
import { MustUseWith } from '../shared/decorators/validators/validators'
import { ToArray } from '../shared/decorators/transformers/transformers'

export class AssetResponseDto {
  @IsNotEmpty()
  @ApiProperty({ type: CryptocurrencyResponseDto })
  cryptocurrency: CryptocurrencyResponseDto

  @IsNotEmpty()
  @IsEnum(SupportedBlockchains)
  @ApiProperty({
    example: SupportedBlockchains.ETHEREUM_MAINNET,
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainId: string

  @IsNotEmpty()
  @ApiProperty({
    example: '2.123123'
  })
  totalUnits: string

  @IsNotEmpty()
  @ApiProperty({
    example: 'USD'
  })
  fiatCurrency: string

  @IsNotEmpty()
  @ApiProperty({
    example: '1530.27'
  })
  currentFiatPrice: string

  @IsNotEmpty()
  @ApiProperty({
    example: '3299.113'
  })
  totalCurrentFiatValue: string

  @IsNotEmpty()
  @ApiProperty({
    example: '3333.222'
  })
  totalCostBasis: string

  static map(params: ToCreateAssetResponseDto): AssetResponseDto {
    const result = new AssetResponseDto()
    result.cryptocurrency = CryptocurrencyResponseDto.map(params.cryptocurrency)
    result.blockchainId = params.blockchainId
    result.totalUnits = params.totalUnits
    result.fiatCurrency = params.fiatCurrency
    result.totalCostBasis = params.totalCostBasis
    result.currentFiatPrice = params.currentFiatPrice
    result.totalCurrentFiatValue = Decimal.mul(params.totalUnits, params.currentFiatPrice).toString()

    return result
  }
}

export class ToCreateAssetResponseDto {
  cryptocurrency: Cryptocurrency
  blockchainId: string
  fiatCurrency: string
  totalUnits: string
  totalCostBasis: string
  currentFiatPrice: string

  static create(params: {
    cryptocurrency: Cryptocurrency
    blockchainId: string
    fiatCurrency: string
    totalUnits: string
    totalCostBasis: string
    currentFiatPrice: string
  }) {
    const response = new ToCreateAssetResponseDto()
    response.cryptocurrency = params.cryptocurrency
    response.blockchainId = params.blockchainId
    response.fiatCurrency = params.fiatCurrency
    response.totalUnits = params.totalUnits
    response.currentFiatPrice = params.currentFiatPrice
    response.totalCostBasis = Decimal.mul(params.totalUnits, params.currentFiatPrice).toString()

    return response
  }
}

export class AssetQueryParams {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Case-insensitive substring searches on name or symbol of the assets',
    example: 'eth',
    required: false
  })
  nameOrSymbol?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Case-insensitive substring searches on name or symbol or address of the assets. This parameter should be deprecated',
    example: 'eth',
    required: false
  })
  nameOrSymbolOrAddress?: string

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint',
    required: false
  })
  blockchainIds?: string[]

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['9c8f7b01-777f-4a0f-9841-5d7d7e844442', '54a2621d-cbaa-4500-b91a-fb21b5070422'],
    required: false
  })
  walletIds?: string[]

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['9c8f7b01-777f-4a0f-9841-5d7d7e844442'],
    required: false
  })
  cryptocurrencyIds?: string[]
}

export class TaxLotQueryParams extends PaginationParams {
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
  @IsString()
  @IsEnum(SupportedBlockchains)
  @ApiProperty({ description: 'Get enum from the publicId of blockchains endpoint', required: false })
  blockchainId?: string

  @IsOptional()
  @IsString()
  @IsEnum([TaxLotStatus.AVAILABLE, TaxLotStatus.SOLD])
  @ApiProperty({
    enum: [TaxLotStatus.AVAILABLE, TaxLotStatus.SOLD],
    example: TaxLotStatus.AVAILABLE,
    required: false
  })
  status?: TaxLotStatus
}

export class TaxLotResponseDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '2e5c9628-6356-4d62-8f3f-9fc86ddb2998'
  })
  id: string

  @IsNotEmpty()
  @ApiProperty({ type: CryptocurrencyResponseDto })
  cryptocurrency: CryptocurrencyResponseDto

  @IsNotEmpty()
  @ApiProperty({
    example: '1.5'
  })
  amountTotal: string

  @IsNotEmpty()
  @ApiProperty({
    example: '0.9'
  })
  amountAvailable: string

  @IsNotEmpty()
  @ApiProperty({
    example: TaxLotStatus.AVAILABLE,
    enum: TaxLotStatus
  })
  status: TaxLotStatus

  @IsNotEmpty()
  @ApiProperty({ type: Date, example: '2023-02-28T07:58:47.000Z' })
  purchasedAt: Date

  @IsNotEmpty()
  @ApiProperty({ type: Date, example: '2023-02-28T07:58:47.000Z' })
  updatedAt: Date

  @IsNotEmpty()
  @ApiProperty({ example: '900' })
  costBasisAmount: string

  @IsNotEmpty()
  @ApiProperty({ example: '1000' })
  costBasisPerUnit: string

  @IsNotEmpty()
  @ApiProperty({ example: 'USD' })
  costBasisFiatCurrency: string

  @IsNotEmpty()
  @ApiProperty({ type: WalletDto })
  wallet: WalletDto

  @IsNotEmpty()
  @ApiProperty({ example: 'c055de00-a82a-4e88-8ddb-ccd9371e3abb' })
  organizationId: string

  static map(taxLot: TaxLot, wallets: Wallet[], enabledBlockchainIds: string[]): TaxLotResponseDto {
    const result = new TaxLotResponseDto()
    result.id = taxLot.publicId
    result.cryptocurrency = CryptocurrencyResponseDto.map(taxLot.cryptocurrency)
    result.amountTotal = taxLot.amountTotal
    result.amountAvailable = taxLot.amountAvailable
    result.status = taxLot.status
    result.purchasedAt = taxLot.purchasedAt
    result.updatedAt = taxLot.updatedAt
    result.costBasisAmount = Decimal.mul(taxLot.amountAvailable, taxLot.costBasisPerUnit).toString()
    result.costBasisPerUnit = taxLot.costBasisPerUnit
    result.costBasisFiatCurrency = taxLot.costBasisFiatCurrency

    const wallet = wallets.find((wallet) => wallet.id === taxLot.walletId)
    result.wallet = wallet ? WalletDto.map({ wallet, enabledBlockchainIds }) : null

    return result
  }
}

export class AssetBalanceQueryParams {
  @IsOptional()
  @ToArray()
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiProperty({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint',
    required: false
  })
  blockchainIds?: string[]

  @IsOptional()
  @ToArray()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiProperty({
    isArray: true,
    example: ['9c8f7b01-777f-4a0f-9841-5d7d7e844442', '54a2621d-cbaa-4500-b91a-fb21b5070422'],
    required: false
  })
  walletIds?: string[]

  @IsOptional()
  @IsEnum([BalanceGroupByFieldEnum.WALLET_ID, BalanceGroupByFieldEnum.BLOCKCHAIN_ID])
  @ApiProperty({
    example: BalanceGroupByFieldEnum.WALLET_ID,
    description: 'Group balance by property',
    required: false
  })
  groupBy?: BalanceGroupByFieldEnum

  @IsOptional()
  @IsEnum([BalanceGroupByFieldEnum.BLOCKCHAIN_ID, BalanceGroupByFieldEnum.WALLET_ID])
  @Validate(MustUseWith, ['groupBy'])
  @ApiProperty({
    example: BalanceGroupByFieldEnum.BLOCKCHAIN_ID,
    description: 'Adding another level of grouping balance by property',
    required: false
  })
  secondGroupBy?: BalanceGroupByFieldEnum
}
