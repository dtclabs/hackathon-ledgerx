import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEnum,
  IsISO8601,
  IsInstance,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Validate
} from 'class-validator'
import Decimal from 'decimal.js'
import { addressHelper } from '../shared/helpers/address.helper'
import { AnnotationDto } from '../annotations/interfaces'
import { CategoryDto } from '../categories/interfaces'
import { IsEthereumOrSolanaAddress } from '../shared/validators/address.validator'
import { ChartOfAccountDto } from '../chart-of-accounts/inferfaces'
import { PaginationParams } from '../core/interfaces'
import { CryptocurrencyResponseDto } from '../cryptocurrencies/interfaces'
import { InvoiceDto } from '../invoices/interfaces'
import { CryptocurrencyImage } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { NOT_NULL_API_STRING, NULL_API_STRING } from '../shared/constants'
import { ToArray, ToArrayLowerCase, ToDecimal } from '../shared/decorators/transformers/transformers'
import { CannotUseWith, MinDecimal } from '../shared/decorators/validators/validators'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import {
  FinancialTransactionChildGnosisMetadata,
  FinancialTransactionGnosisConfirmation
} from '../shared/entity-services/financial-transactions/financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionFile } from '../shared/entity-services/financial-transactions/financial-transaction-files.entity'
import { FinancialTransactionParent } from '../shared/entity-services/financial-transactions/financial-transaction-parent.entity'
import {
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataNames,
  FinancialTransactionChildMetadataStatus,
  FinancialTransactionChildMetadataSubstatus,
  FinancialTransactionChildMetadataType,
  FinancialTransactionChildPaymentMetadata,
  FinancialTransactionParentActivity,
  FinancialTransactionParentExportStatus,
  FinancialTransactionParentStatus
} from '../shared/entity-services/financial-transactions/interfaces'
import { TaxLotSale } from '../shared/entity-services/gains-losses/tax-lot-sale.entity'

export class FinancialTransactionParentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3' })
  hash: string

  @IsNotEmpty()
  @IsEnum(SupportedBlockchains)
  @ApiProperty({
    example: SupportedBlockchains.ETHEREUM_MAINNET,
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainId: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ enum: FinancialTransactionParentActivity, example: FinancialTransactionParentActivity.SWAP })
  activity: FinancialTransactionParentActivity

  @IsNotEmpty()
  @ApiProperty({ enum: FinancialTransactionParentStatus, example: FinancialTransactionParentStatus.ACTIVE })
  status: FinancialTransactionParentStatus

  @IsNotEmpty()
  @ApiProperty({
    enum: FinancialTransactionParentExportStatus,
    example: FinancialTransactionParentExportStatus.UNEXPORTED
  })
  exportStatus: FinancialTransactionParentExportStatus

  @IsNotEmpty()
  @ApiProperty({ maxLength: 15 })
  exportStatusReason: string

  @ApiProperty({ type: InvoiceDto, isArray: true })
  invoices: InvoiceDto[]

  @IsNotEmpty()
  @ApiProperty({ example: '2023-02-28T07:58:47.000Z' })
  valueTimestamp: Date

  @IsNotEmpty()
  @ApiProperty({ example: 2 })
  childCount: number

  static map(financialTransactionParent: FinancialTransactionParent): FinancialTransactionParentDto {
    const result = new FinancialTransactionParentDto()
    result.hash = financialTransactionParent.hash
    result.blockchainId = financialTransactionParent.blockchainId
    result.activity = financialTransactionParent.activity
    result.status = financialTransactionParent.status
    result.exportStatus = financialTransactionParent.exportStatus
    result.exportStatusReason = financialTransactionParent.exportStatusReason?.substring(0, 15)
    result.invoices = financialTransactionParent.invoices?.map((invoice) => InvoiceDto.map(invoice))
    result.valueTimestamp = financialTransactionParent.valueTimestamp
    result.childCount = financialTransactionParent.financialTransactionChild?.length ?? 0
    return result
  }
}

export class GnosisMultisigConfirmationDto {
  @ApiProperty({ example: '0x2170430E7c8DE0A588E5DA04823E2c6a8c658D2f' })
  owner: string
  @ApiProperty({ nullable: true })
  ownerContact: ContactDto
  @ApiProperty({ example: '2022-12-22T09:44:48Z' })
  submissionDate: string
  @ApiProperty({ example: '0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3' })
  transactionHash: string
  @ApiProperty({ example: 'APPROVED_HASH', enum: ['APPROVED_HASH', 'ETH_SIGN'] })
  signatureType: string

  static map(
    confirmation: FinancialTransactionGnosisConfirmation,
    contacts: { [address: string]: ContactDto }
  ): GnosisMultisigConfirmationDto {
    const result = new GnosisMultisigConfirmationDto()
    result.owner = confirmation.owner
    result.submissionDate = confirmation.submissionDate
    result.transactionHash = confirmation.transactionHash
    result.signatureType = confirmation.signatureType
    result.ownerContact = contacts[confirmation.owner?.toLowerCase()] ?? null
    return result
  }
}

export class FinancialTransactionGnosisMetadataDto {
  @ApiProperty({ example: '2022-12-22T09:44:48Z' })
  executionDate: string
  @ApiProperty({ example: '2022-12-22T09:44:48Z' })
  submissionDate: string
  @ApiProperty({ example: '2022-12-22T09:44:48Z' })
  modified: string
  @ApiProperty({ example: '0xd9bbc4c534f09b1b6651f4e44c16bc4fca1fccf11dae1cc05269e3626e9df517' })
  safeTxHash: string
  @ApiProperty({ example: 2 })
  confirmationsRequired: number
  @ApiProperty({ isArray: true, type: GnosisMultisigConfirmationDto })
  confirmations: GnosisMultisigConfirmationDto[]

  static map(
    metadata: FinancialTransactionChildGnosisMetadata,
    contacts: { [address: string]: ContactDto }
  ): FinancialTransactionGnosisMetadataDto {
    const result = new FinancialTransactionGnosisMetadataDto()
    result.executionDate = metadata.executionDate
    result.submissionDate = metadata.submissionDate
    result.modified = metadata.modified
    result.safeTxHash = metadata.safeTxHash
    result.confirmationsRequired = metadata.confirmationsRequired
    result.confirmations = metadata.confirmations?.map((confirmation) =>
      GnosisMultisigConfirmationDto.map(confirmation, contacts)
    )
    return result
  }
}

export class FinancialTransactionChildPaymentMetadataDto {
  @ApiProperty()
  createdBy: string

  @ApiProperty()
  reviewedBy: string

  @ApiProperty()
  executedBy: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  reviewedAt: Date

  @ApiProperty()
  executedAt: Date

  static map(metadata: FinancialTransactionChildPaymentMetadata): FinancialTransactionChildPaymentMetadataDto {
    const dto = new FinancialTransactionChildPaymentMetadataDto()
    dto.createdBy = metadata.createdBy
    dto.reviewedBy = metadata.reviewedBy
    dto.executedBy = metadata.executedBy
    dto.createdAt = metadata.createdAt
    dto.reviewedAt = metadata.reviewedAt
    dto.executedAt = metadata.executedAt
    return dto
  }
}

export class FinancialTransactionChildMetadataTypeDto {
  @ApiProperty({ enum: FinancialTransactionChildMetadataType, example: FinancialTransactionChildMetadataType.DEPOSIT })
  value: FinancialTransactionChildMetadataType
  @ApiProperty({ example: FinancialTransactionChildMetadataNames[FinancialTransactionChildMetadataType.DEPOSIT] })
  label: string

  static map(type: FinancialTransactionChildMetadataType): FinancialTransactionChildMetadataTypeDto {
    const result = new FinancialTransactionChildMetadataTypeDto()
    result.value = type
    result.label = FinancialTransactionChildMetadataNames[type] ?? type
    return result
  }
}

export class FinancialTransactionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'hq167047466300067b8d5bd9bf4941d4' })
  id: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3' })
  hash: string

  @IsNotEmpty()
  @IsEnum(SupportedBlockchains)
  @ApiProperty({
    example: SupportedBlockchains.ETHEREUM_MAINNET,
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainId: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ enum: FinancialTransactionChildMetadataType, example: FinancialTransactionChildMetadataType.DEPOSIT })
  type: FinancialTransactionChildMetadataType

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  typeDetail: FinancialTransactionChildMetadataTypeDto

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '0xc36442b4a4522e871399cd717abdd847ab11fe88' })
  fromAddress: string

  @IsString()
  @ApiProperty({ nullable: true, example: '0x7078d9efadefcf699c46d6d7bad84e99eb29fd6d' })
  toAddress: string

  @IsString()
  @ApiProperty({ nullable: true, example: '0x7078d9efadefcf699c46d6d7bad84e99eb29fd6d' })
  proxyAddress: string

  @IsNotEmpty()
  @ApiProperty({ type: CryptocurrencyResponseDto })
  cryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({
    example: {
      "large": "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
      "small": "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
      "thumb": "https://assets.coingecko.com/coins/images/6319/thumb/usdc.png"
    }
  })
  image: CryptocurrencyImage

  @IsNotEmpty()
  @ApiProperty({ example: '0.004473765531106052' })
  cryptocurrencyAmount: string

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ example: '2023-02-28T07:58:47.000Z' })
  valueTimestamp: Date

  @IsNotEmpty()
  @ApiProperty({ type: FinancialTransactionParentDto })
  financialTransactionParent: FinancialTransactionParentDto

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    enum: FinancialTransactionChildMetadataStatus,
    example: FinancialTransactionChildMetadataStatus.SYNCED
  })
  status: FinancialTransactionChildMetadataStatus

  @ApiProperty({
    enum: FinancialTransactionChildMetadataSubstatus,
    example: [FinancialTransactionChildMetadataSubstatus.MISSING_COST_BASIS],
    isArray: true
  })
  substatuses: FinancialTransactionChildMetadataSubstatus[]

  @ApiProperty({ nullable: true })
  fromContact: ContactDto

  @ApiProperty({ nullable: true })
  toContact: ContactDto

  @ApiProperty({ nullable: true })
  costBasis: string

  @ApiProperty({ nullable: true })
  fiatAmount: string

  @ApiProperty({ nullable: true })
  fiatAmountPerUnit: string

  @ApiProperty({ nullable: true })
  fiatCurrency: string

  @ApiProperty({ nullable: true })
  gainLoss: string

  @ApiProperty({ nullable: true, example: FinancialTransactionChildMetadataDirection.INCOMING })
  direction: FinancialTransactionChildMetadataDirection

  @ApiProperty({ nullable: true })
  category: CategoryDto

  @ApiProperty({ nullable: true })
  correspondingChartOfAccount: ChartOfAccountDto

  @ApiProperty({ nullable: true, isArray: true })
  gnosisMetadata: FinancialTransactionGnosisMetadataDto

  @ApiProperty({ nullable: true })
  paymentMetadata: FinancialTransactionChildPaymentMetadataDto

  @ApiProperty({ nullable: true, example: 'My note' })
  note: string | null

  @ApiProperty({ type: AnnotationDto, isArray: true, nullable: true })
  annotations: AnnotationDto[]

  static map(
    financialTransactionChild: FinancialTransactionChild,
    hasParentDto: boolean,
    contacts: { [address: string]: ContactDto }
  ): FinancialTransactionDto {
    const result = new FinancialTransactionDto()
    result.id = financialTransactionChild.publicId
    result.hash = financialTransactionChild.hash
    result.blockchainId = financialTransactionChild.blockchainId
    // Apply blockchain-aware address formatting
    result.fromAddress = addressHelper.formatAddressForBlockchain(
      financialTransactionChild.fromAddress, 
      financialTransactionChild.blockchainId
    )
    result.toAddress = addressHelper.formatAddressForBlockchain(
      financialTransactionChild.toAddress, 
      financialTransactionChild.blockchainId
    )
    result.proxyAddress = addressHelper.formatAddressForBlockchain(
      financialTransactionChild.proxyAddress, 
      financialTransactionChild.blockchainId
    )
    result.cryptocurrency = CryptocurrencyResponseDto.map(financialTransactionChild.cryptocurrency)
    // Use the same public image URLs as the cryptocurrency object
    result.image = result.cryptocurrency.image
    result.cryptocurrencyAmount = financialTransactionChild.cryptocurrencyAmount
    result.valueTimestamp = financialTransactionChild.valueTimestamp

    const metadata = financialTransactionChild.financialTransactionChildMetadata
    result.type = metadata.type
    result.typeDetail = FinancialTransactionChildMetadataTypeDto.map(metadata.type)
    result.status = metadata.status
    result.substatuses = metadata.substatuses
    result.costBasis = metadata.costBasis
    result.fiatAmount = metadata.fiatAmount
    result.fiatAmountPerUnit = metadata.fiatAmountPerUnit
    result.fiatCurrency = metadata.fiatCurrency
    result.gainLoss = metadata.gainLoss
    result.direction = metadata.direction
    result.note = metadata.note
    result.direction = metadata.direction

    result.category = metadata.category ? CategoryDto.map(metadata.category) : null

    // Check the convertDto function on how the below can be changed
    result.correspondingChartOfAccount = metadata.correspondingChartOfAccount
      ? ChartOfAccountDto.map(metadata.correspondingChartOfAccount)
      : null

    result.financialTransactionParent = hasParentDto
      ? FinancialTransactionParentDto.map(financialTransactionChild.financialTransactionParent)
      : null

    if (financialTransactionChild.financialTransactionChildMetadata.gnosisMetadata) {
      result.gnosisMetadata = FinancialTransactionGnosisMetadataDto.map(
        financialTransactionChild.financialTransactionChildMetadata.gnosisMetadata,
        contacts
      )
    }

    if (financialTransactionChild.financialTransactionChildMetadata.paymentMetadata) {
      result.paymentMetadata = FinancialTransactionChildPaymentMetadataDto.map(
        financialTransactionChild.financialTransactionChildMetadata.paymentMetadata
      )
    }

    result.fromContact = contacts[financialTransactionChild.fromAddress?.toLowerCase()] ?? null
    result.toContact = contacts[financialTransactionChild.toAddress?.toLowerCase()] ?? null

    if (financialTransactionChild.financialTransactionChildAnnotations?.length) {
      financialTransactionChild.financialTransactionChildAnnotations.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )
      result.annotations = financialTransactionChild.financialTransactionChildAnnotations.map((childAnnotation) =>
        AnnotationDto.map(childAnnotation.annotation)
      )
    }

    return result
  }
}

interface FinancialTransactionFilter {
  blockchainIds: string[]
  activities: FinancialTransactionParentActivity[]
  exportStatuses: FinancialTransactionParentExportStatus[]
  invoices: string[]
  childStatuses: FinancialTransactionChildMetadataStatus[]
  childTypes: FinancialTransactionChildMetadataType[]
  substatuses: FinancialTransactionChildMetadataSubstatus[]
  walletAddresses: string[]
  startTime: string
  endTime: string
  assetIds: string[]
  fromWalletAddresses: string[]
  toWalletAddresses: string[]
  fromAddresses: string[]
  toAddresses: string[]
  annotations: string[]
  fromFiatAmount: Decimal
  toFiatAmount: Decimal
}

export interface SolanaFinancialTransactionQueryParams {
  page?: number
  size?: number
  walletIds?: string[]
  walletGroupIds?: string[]
  symbol?: string
  type?: string
  direction?: string
  startDate?: Date
  endDate?: Date
  fromDate?: Date // Alias for startDate
  toDate?: Date   // Alias for endDate
  fromAddress?: string
  toAddress?: string
  address?: string // Filter by either from or to address
  txHash?: string // Filter by transaction hash
  activity?: string // Filter by transaction activity
  substatuses?: string[] // Filter by transaction substatuses
  walletAddresses?: string[] // Filter by wallet addresses
}

export class FinancialTransactionQueryParams extends PaginationParams implements FinancialTransactionFilter {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiProperty({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainIds: string[]

  @IsOptional()
  @ToArray()
  @IsEnum(FinancialTransactionParentActivity, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionParentActivity,
    example: [FinancialTransactionParentActivity.SWAP, FinancialTransactionParentActivity.TRANSFER]
  })
  activities: FinancialTransactionParentActivity[]

  @IsOptional()
  @ToArray()
  @IsEnum(FinancialTransactionParentExportStatus, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionParentExportStatus,
    example: [FinancialTransactionParentExportStatus.EXPORTED, FinancialTransactionParentExportStatus.FAILED]
  })
  exportStatuses: FinancialTransactionParentExportStatus[]

  @IsOptional()
  @ToArray()
  @IsEnum([NOT_NULL_API_STRING], { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: [NOT_NULL_API_STRING],
    example: [NOT_NULL_API_STRING]
  })
  invoices: string[]

  @IsOptional()
  @ToArray()
  @IsArray()
  @IsEnum(FinancialTransactionChildMetadataStatus, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionChildMetadataStatus,
    example: [
      FinancialTransactionChildMetadataStatus.SYNCED,
      FinancialTransactionChildMetadataStatus.SYNCING,
      FinancialTransactionChildMetadataStatus.IGNORED
    ]
  })
  childStatuses: FinancialTransactionChildMetadataStatus[]

  @IsOptional()
  @IsArray()
  @ToArray()
  @IsEnum(FinancialTransactionChildMetadataType, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionChildMetadataType,
    example: [FinancialTransactionChildMetadataType.FEE, FinancialTransactionChildMetadataType.DEPOSIT]
  })
  childTypes: FinancialTransactionChildMetadataType[]

  @IsOptional()
  @IsArray()
  @ToArray()
  @IsEnum(FinancialTransactionChildMetadataSubstatus, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionChildMetadataSubstatus,
    example: [
      FinancialTransactionChildMetadataSubstatus.MISSING_COST_BASIS,
      FinancialTransactionChildMetadataSubstatus.MISSING_PRICE
    ]
  })
  substatuses: FinancialTransactionChildMetadataSubstatus[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0', '0xd0c1C91488d4D1913d92EEdd75Ea5913794952be']
  })
  walletAddresses: string[]

  @IsOptional()
  @IsString()
  @IsISO8601({ strict: true })
  @ApiPropertyOptional({ example: '2022-01-01' })
  startTime: string

  @IsOptional()
  @IsString()
  @IsISO8601({ strict: true })
  @ApiPropertyOptional({ example: '2023-01-01' })
  endTime: string

  @IsArray()
  @IsOptional()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad', 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  assetIds: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  fromWalletAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  toWalletAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  fromAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  toAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ApiPropertyOptional({
    isArray: true,
    example: [NULL_API_STRING, 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  annotations: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ApiPropertyOptional({
    isArray: true,
    example: [NULL_API_STRING, 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  correspondingChartOfAccountIds: string[]

  @IsOptional()
  @IsInstance(Decimal)
  @MinDecimal(0)
  @ToDecimal()
  @ApiPropertyOptional({ example: '10.72', type: String })
  fromFiatAmount: Decimal

  @IsOptional()
  @IsInstance(Decimal)
  @MinDecimal(0)
  @ToDecimal()
  @ApiPropertyOptional({ example: '32.72', type: String })
  toFiatAmount: Decimal
}

export class FinancialTransactionQueryExportParams implements FinancialTransactionFilter {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiProperty({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainIds: string[]

  @IsOptional()
  @ToArray()
  @IsEnum(FinancialTransactionParentActivity, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionParentActivity,
    example: [FinancialTransactionParentActivity.SWAP, FinancialTransactionParentActivity.TRANSFER]
  })
  activities: FinancialTransactionParentActivity[]

  @IsOptional()
  @ToArray()
  @IsEnum(FinancialTransactionParentExportStatus, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionParentExportStatus,
    example: [FinancialTransactionParentExportStatus.EXPORTED, FinancialTransactionParentExportStatus.FAILED]
  })
  exportStatuses: FinancialTransactionParentExportStatus[]

  @IsOptional()
  @ToArray()
  @IsEnum([NOT_NULL_API_STRING], { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: [NOT_NULL_API_STRING],
    example: [NOT_NULL_API_STRING]
  })
  invoices: string[]

  @IsOptional()
  @ToArray()
  @IsArray()
  @IsEnum(FinancialTransactionChildMetadataStatus, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionChildMetadataStatus,
    example: [
      FinancialTransactionChildMetadataStatus.SYNCED,
      FinancialTransactionChildMetadataStatus.SYNCING,
      FinancialTransactionChildMetadataStatus.IGNORED
    ]
  })
  childStatuses: FinancialTransactionChildMetadataStatus[]

  @IsOptional()
  @IsArray()
  @ToArray()
  @IsEnum(FinancialTransactionChildMetadataType, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionChildMetadataType,
    example: [FinancialTransactionChildMetadataType.FEE, FinancialTransactionChildMetadataType.DEPOSIT]
  })
  childTypes: FinancialTransactionChildMetadataType[]

  @IsOptional()
  @IsArray()
  @ToArray()
  @IsEnum(FinancialTransactionChildMetadataSubstatus, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: FinancialTransactionChildMetadataSubstatus,
    example: [
      FinancialTransactionChildMetadataSubstatus.MISSING_COST_BASIS,
      FinancialTransactionChildMetadataSubstatus.MISSING_PRICE
    ]
  })
  substatuses: FinancialTransactionChildMetadataSubstatus[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0', '0xd0c1C91488d4D1913d92EEdd75Ea5913794952be']
  })
  walletAddresses: string[]

  @IsOptional()
  @IsString()
  @IsISO8601({ strict: true })
  @ApiPropertyOptional({ example: '2022-01-01' })
  startTime: string

  @IsOptional()
  @IsString()
  @IsISO8601({ strict: true })
  @ApiPropertyOptional({ example: '2023-01-01' })
  endTime: string

  @IsArray()
  @IsOptional()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad', 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  assetIds: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  fromWalletAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  toWalletAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  fromAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ToArrayLowerCase()
  @IsEthereumOrSolanaAddress({ each: true, message: "Each address must be a valid Ethereum or Solana address" })
  @ApiPropertyOptional({
    isArray: true,
    example: ['0xd0c1C91488d4D1913d92EEdd75Ea5913794952be', '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0']
  })
  toAddresses: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ApiPropertyOptional({
    isArray: true,
    example: [NULL_API_STRING, 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  annotations: string[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @ApiPropertyOptional({
    isArray: true,
    example: [NULL_API_STRING, 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  correspondingChartOfAccountIds: string[]

  @IsOptional()
  @IsInstance(Decimal)
  @MinDecimal(0)
  @ToDecimal()
  @ApiPropertyOptional({ example: '10.72', type: String })
  fromFiatAmount: Decimal

  @IsOptional()
  @IsInstance(Decimal)
  @MinDecimal(0)
  @ToDecimal()
  @ApiPropertyOptional({ example: '32.72', type: String })
  toFiatAmount: Decimal
}

export class FinancialTransactionParentDetailDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3' })
  hash: string

  @IsNotEmpty()
  @IsEnum(SupportedBlockchains)
  @ApiProperty({
    example: SupportedBlockchains.ETHEREUM_MAINNET,
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainId: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ enum: FinancialTransactionParentActivity, example: FinancialTransactionParentActivity.SWAP })
  activity: FinancialTransactionParentActivity

  @IsNotEmpty()
  @ApiProperty({ enum: FinancialTransactionParentStatus, example: FinancialTransactionParentStatus.ACTIVE })
  status: FinancialTransactionParentStatus

  @IsNotEmpty()
  @ApiProperty({ example: '2023-02-28T07:58:47.000Z' })
  valueTimestamp: Date

  @IsNotEmpty()
  @ApiProperty({ isArray: true, type: FinancialTransactionDto })
  financialTransactions: FinancialTransactionDto[]

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Salary payment to employees' })
  remark: string

  static map(
    financialTransactionParent: FinancialTransactionParent,
    contacts: { [address: string]: ContactDto }
  ): FinancialTransactionParentDetailDto {
    const result = new FinancialTransactionParentDetailDto()
    result.hash = financialTransactionParent.hash
    result.blockchainId = financialTransactionParent.blockchainId
    result.activity = financialTransactionParent.activity
    result.status = financialTransactionParent.status
    result.valueTimestamp = financialTransactionParent.valueTimestamp
    result.remark = financialTransactionParent.remark
    result.financialTransactions = []
    for (const child of financialTransactionParent.financialTransactionChild) {
      result.financialTransactions.push(FinancialTransactionDto.map(child, false, contacts))
    }

    return result
  }
}

export class FinancialTransactionUpdateDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  // If FE pass string 'null', it will be interpreted as null value
  @ApiPropertyOptional({ description: 'Either a chart of account uuid or null value.' })
  correspondingChartOfAccountId: string

  // @IsOptional()
  // @IsString()
  // @IsIn([FinancialTransactionChildMetadataStatus.IGNORED, FinancialTransactionChildMetadataStatus.SYNCED])
  // @ApiPropertyOptional({
  //   example: 'ignored',
  //   enum: [FinancialTransactionChildMetadataStatus.IGNORED, FinancialTransactionChildMetadataStatus.SYNCED]
  // })
  // status: FinancialTransactionChildMetadataStatus

  @IsOptional()
  @IsInstance(Decimal)
  @MinDecimal(0)
  @ToDecimal()
  @Validate(CannotUseWith, ['unitAmount'])
  @Validate(Min, [0])
  @ApiPropertyOptional({ example: '32.72', type: String })
  amount: Decimal

  @IsOptional()
  @IsInstance(Decimal)
  @MinDecimal(0)
  @ToDecimal()
  @Validate(CannotUseWith, ['amount'])
  @ApiPropertyOptional({ example: '1.26', type: String })
  amountPerUnit: Decimal

  @IsOptional()
  @IsInstance(Decimal)
  @MinDecimal(0)
  @ToDecimal()
  @ApiPropertyOptional({ example: '3.26', type: String })
  costBasis: Decimal

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Please leave comment' })
  note: string | null
}

export class FinancialTransactionParentUpdateDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ nullable: true })
  remark: string
}

export class FinancialTransactionFileDto {
  @ApiProperty({ example: 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad' })
  id: string
  @ApiProperty({ example: 'filename.csv' })
  name: string

  @ApiProperty({ example: 6666 })
  size: number
  @ApiProperty({ example: 'text/csv' })
  mimeType: string

  static map(file: FinancialTransactionFile): FinancialTransactionFileDto {
    const result = new FinancialTransactionFileDto()
    result.id = file.publicId
    result.name = file.name
    result.size = file.size
    result.mimeType = file.mimeType
    return result
  }
}

export class FinancialTransactionChildTaxLotSalesDto {
  @ApiProperty({ example: '0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3', nullable: false })
  hash: string

  @ApiProperty({ example: '2023-09-28T07:58:47.000Z', nullable: false })
  purchasedAt: Date

  @ApiProperty({ type: CryptocurrencyResponseDto, nullable: false })
  cryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ example: '2', nullable: false })
  soldAmount: string

  @ApiProperty({ example: '0.2', nullable: false })
  costBasisAmount: string

  @ApiProperty({ example: '0.1', nullable: false })
  costBasisPerUnit: string

  @ApiProperty({ example: 'USD', nullable: false })
  costBasisFiatCurrency: string

  static map(taxLotSale: TaxLotSale, hash: string, purchasedAt: Date): FinancialTransactionChildTaxLotSalesDto {
    const dto = new FinancialTransactionChildTaxLotSalesDto()
    dto.hash = hash
    dto.purchasedAt = purchasedAt

    dto.cryptocurrency = CryptocurrencyResponseDto.map(taxLotSale.cryptocurrency)
    dto.soldAmount = taxLotSale.soldAmount
    dto.costBasisAmount = taxLotSale.costBasisAmount
    dto.costBasisPerUnit = taxLotSale.costBasisPerUnit
    dto.costBasisFiatCurrency = taxLotSale.costBasisFiatCurrency

    return dto
  }
}

export class CreateAnnotationDto {
  @ApiProperty({
    description: 'Id of the annotation',
    example: 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad'
  })
  @IsNotEmpty()
  annotationId: string
}
