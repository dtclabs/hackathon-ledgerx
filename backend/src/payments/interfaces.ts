import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { AnnotationDto } from '../annotations/interfaces'
import { ChartOfAccountDto } from '../chart-of-accounts/inferfaces'
import { PaginationParams } from '../core/interfaces'
import { CryptocurrencyResponseDto } from '../cryptocurrencies/interfaces'
import { TripleAPurposeOfRemittance } from '../domain/integrations/triple-a/interfaces'
import { FiatCurrencyDetailedDto } from '../fiat-currencies/interfaces'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { Account } from '../shared/entity-services/account/account.entity'
import { Annotation } from '../shared/entity-services/annotations/annotation.entity'
import { ChartOfAccount } from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { FiatCurrency } from '../shared/entity-services/fiat-currencies/fiat-currency.entity'
import { Member } from '../shared/entity-services/members/member.entity'
import {
  CurrencyType,
  DestinationMetadata,
  DestinationType,
  PaymentMetadata,
  PaymentStatus,
  PaymentType,
  ProviderStatus,
  Recipient
} from '../shared/entity-services/payments/interfaces'
import { Payment } from '../shared/entity-services/payments/payment.entity'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'

export class PaymentsQueryParams extends PaginationParams {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate: Date

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsEnum(PaymentStatus, { each: true })
  statuses: PaymentStatus[]

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsEnum(ProviderStatus, { each: true })
  providerStatuses: ProviderStatus[]

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsString({ each: true })
  destinationAddresses: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsString({ each: true })
  cryptocurrencies: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsString({ each: true })
  sourceCryptocurrencies: string[]

  @ApiPropertyOptional()
  @ValidateIf((obj) => obj.destinationCurrencies && obj.destinationCurrencies.length > 0)
  @IsEnum(CurrencyType)
  destinationCurrencyType: CurrencyType

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsString({ each: true })
  destinationCurrencies: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsUUID('all', { each: true })
  chartOfAccountIds: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsUUID('all', { each: true })
  annotationIds: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  reviewerIds: string[]
}

export class RecipientsQueryParams {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CurrencyType)
  destinationCurrencyType: CurrencyType
}

export class RecipientDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  address: string

  static map(recipient: Recipient): RecipientDto {
    const dto = new RecipientDto()
    dto.name = recipient.destinationName
    dto.address = recipient.destinationAddress
    return dto
  }
}

export class DestinationMetadataDto {
  @ApiProperty({ required: true })
  @IsUUID()
  id: string

  @ApiProperty({ required: true })
  @IsEnum(DestinationType)
  type: DestinationType

  @ApiPropertyOptional()
  bankName: string

  @ApiPropertyOptional()
  accountNumberLast4: string

  static map(destinationMetadata: DestinationMetadata): DestinationMetadataDto {
    const dto = new DestinationMetadataDto()
    dto.id = destinationMetadata.id
    dto.type = destinationMetadata.type
    dto.bankName = destinationMetadata.bankName
    dto.accountNumberLast4 = destinationMetadata.accountNumberLast4
    return dto
  }
}

export class CreatePaymentMetadataDto {
  @ApiProperty({ required: true })
  @IsEnum(TripleAPurposeOfRemittance)
  purposeOfTransfer: TripleAPurposeOfRemittance

  @ApiPropertyOptional()
  method: unknown

  @ApiPropertyOptional()
  metamaskTransaction: unknown

  @ApiPropertyOptional()
  safeTransaction: unknown

  @ApiPropertyOptional()
  proposedTransactionHash: string
}

export class UpdatePaymentMetadataDto extends CreatePaymentMetadataDto {}

export class PaymentMetadataDto {
  @ApiProperty()
  @IsEnum(TripleAPurposeOfRemittance)
  purposeOfTransfer: TripleAPurposeOfRemittance

  @ApiProperty()
  quote: {
    expiresAt: string
    fee: number
    feeCurrency: string
  }

  static map(paymentMetadata: PaymentMetadata): PaymentMetadataDto {
    const dto = new PaymentMetadataDto()
    dto.purposeOfTransfer = paymentMetadata.purposeOfTransfer
    if (paymentMetadata.quote) {
      dto.quote = {
        expiresAt: paymentMetadata.quote.expires_at,
        fee: paymentMetadata.quote.fee,
        feeCurrency: paymentMetadata.quote.fee_currency
      }
    }
    return dto
  }
}

export class UpdatePaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  destinationAddress: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  destinationName: string

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => DestinationMetadataDto)
  destinationMetadata: DestinationMetadataDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cryptocurrencyId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sourceCryptocurrencyId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  destinationCurrencyId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  amount: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  sourceAmount: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  destinationAmount: string

  @ApiPropertyOptional()
  @Type(() => UpdatePaymentMetadataDto)
  metadata: UpdatePaymentMetadataDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chartOfAccountId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  annotationIds: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  files: string[]

  @ApiPropertyOptional()
  notes: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reviewerId: string
}

export class CreatePaymentDto {
  @ApiPropertyOptional()
  @ValidateIf((obj) => [PaymentStatus.PREVIEW, PaymentStatus.EXECUTING].includes(obj.status))
  @IsNotEmpty()
  @IsString()
  blockchainId: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => [PaymentStatus.PREVIEW, PaymentStatus.EXECUTING].includes(obj.status))
  @IsUUID()
  sourceWalletId: string

  @ApiProperty({ required: true })
  @IsEnum(PaymentStatus)
  @IsIn([PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.PREVIEW, PaymentStatus.EXECUTING])
  status: PaymentStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType: PaymentType

  @ApiPropertyOptional()
  @ValidateIf((obj) => obj.destinationCurrencyType === CurrencyType.CRYPTO)
  @IsNotEmpty()
  @IsString()
  destinationAddress: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => obj.destinationName)
  @IsNotEmpty()
  @IsString()
  destinationName: string

  @ApiProperty({ required: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DestinationMetadataDto)
  destinationMetadata: DestinationMetadataDto

  @ApiPropertyOptional()
  @ValidateIf((obj) => obj.status !== PaymentStatus.CREATED && !obj.sourceCryptocurrencyId)
  @IsUUID()
  cryptocurrencyId: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => obj.status !== PaymentStatus.CREATED && !obj.cryptocurrencyId)
  @IsUUID()
  sourceCryptocurrencyId: string

  @ApiPropertyOptional()
  @IsEnum(CurrencyType)
  destinationCurrencyType: CurrencyType = CurrencyType.CRYPTO

  @ApiPropertyOptional()
  @ValidateIf(
    (obj) =>
      (obj.status !== PaymentStatus.CREATED && !obj.cryptocurrencyId) ||
      obj.destinationCurrencyType === CurrencyType.FIAT
  )
  @IsNotEmpty()
  @IsString()
  destinationCurrencyId: string

  @ApiPropertyOptional()
  @ValidateIf(
    (obj) =>
      obj.status !== PaymentStatus.CREATED && obj.destinationCurrencyType != CurrencyType.FIAT && !obj.sourceAmount
  )
  @IsNumberString()
  amount: string

  @ApiPropertyOptional()
  @ValidateIf(
    (obj) => obj.status !== PaymentStatus.CREATED && obj.destinationCurrencyType != CurrencyType.FIAT && !obj.amount
  )
  @IsNumberString()
  sourceAmount: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => obj.status !== PaymentStatus.CREATED && !obj.amount)
  @IsNumberString()
  destinationAmount: string

  @ApiPropertyOptional()
  @ValidateIf(
    (obj) =>
      obj.destinationCurrencyType == CurrencyType.FIAT &&
      (obj.metadata?.purposeOfTransfer || obj.status !== PaymentStatus.CREATED)
  )
  @ValidateNested()
  @Type(() => CreatePaymentMetadataDto)
  metadata: CreatePaymentMetadataDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chartOfAccountId: string

  @ApiPropertyOptional()
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsUUID('all', { each: true })
  annotationIds: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  files: string[]

  @ApiPropertyOptional()
  notes: string

  @ApiPropertyOptional()
  remarks: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reviewerId: string
}

export class SetExecutingPaymentsDto {
  @ApiProperty({ required: true })
  @IsUUID('all', { each: true })
  ids: string[]

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  blockchainId: string

  @ApiProperty({ required: true })
  @IsUUID()
  sourceWalletId: string

  @ApiProperty({ required: true })
  @IsEnum(PaymentType)
  paymentType: PaymentType

  @ApiPropertyOptional()
  remarks: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proposedTransactionHash: string
}

export class SetExecutedPaymentDto {
  @ApiProperty({ required: true })
  @IsUUID()
  id: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => !obj.safeHash)
  @IsString()
  hash: string

  @ApiPropertyOptional()
  @ValidateIf((obj) => !obj.hash)
  @IsString()
  safeHash: string

  @ApiPropertyOptional()
  metadata: {
    method?: unknown
    metamaskTransaction?: unknown
    safeTransaction?: unknown
  }
}

export class SetFailedPaymentsDto {
  @ApiProperty({ required: true })
  @IsUUID('all', { each: true })
  ids: string[]
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

export class AccountDto {
  @ApiProperty()
  name: string

  static map(account: Account): AccountDto {
    const dto = new AccountDto()
    dto.name = `${account.firstName} ${account.lastName}`.trim()
    return dto
  }
}

export class MemberDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  account: AccountDto

  static map(member: Member): MemberDto {
    const dto = new MemberDto()
    dto.id = member.publicId
    dto.account = member.deletedAt ? null : AccountDto.map(member.account)
    return dto
  }
}

export class PaymentDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  blockchainId: string

  @ApiProperty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus

  @ApiProperty()
  @IsEnum(ProviderStatus)
  providerStatus: ProviderStatus

  @ApiProperty()
  @IsEnum(PaymentType)
  paymentType: PaymentType

  @ApiProperty()
  hash: string

  @ApiProperty()
  safeHash: string

  @ApiProperty()
  sourceWallet: WalletDto

  @ApiProperty()
  destinationAddress: string

  @ApiProperty()
  destinationName: string

  @ApiProperty()
  destinationMetadata: DestinationMetadataDto

  @ApiProperty()
  cryptocurrency: CryptocurrencyResponseDto

  @ApiProperty()
  sourceCryptocurrency: CryptocurrencyResponseDto

  @ApiProperty()
  destinationCurrencyType: CurrencyType

  @ApiProperty()
  destinationCurrency: CryptocurrencyResponseDto | FiatCurrencyDetailedDto

  @ApiProperty()
  amount: string

  @ApiProperty()
  sourceAmount: string

  @ApiProperty()
  destinationAmount: string

  @ApiProperty()
  chartOfAccount: ChartOfAccountDto

  @ApiProperty({ isArray: true, type: AnnotationDto })
  annotations: AnnotationDto[]

  @ApiProperty()
  files: string[]

  @ApiProperty()
  notes: string

  @ApiProperty()
  remarks: string

  @ApiProperty()
  reviewer: MemberDto

  @ApiProperty()
  metadata: PaymentMetadataDto

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  createdBy: AccountDto

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  updatedBy: AccountDto

  @ApiProperty()
  reviewRequestedAt: Date

  @ApiProperty()
  reviewRequestedBy: AccountDto

  @ApiProperty()
  reviewedAt: Date

  @ApiProperty()
  reviewedBy: AccountDto

  @ApiProperty()
  executedAt: Date

  @ApiProperty()
  executedBy: AccountDto

  @ApiProperty()
  failedAt: Date

  static map(
    payment: Payment,
    chartofAccount: ChartOfAccount,
    annotations: Annotation[],
    reviewer: Member,
    destinationCurrency: FiatCurrency | Cryptocurrency
  ): PaymentDto {
    const dto = new PaymentDto()
    dto.id = payment.publicId
    dto.blockchainId = payment.blockchainId
    dto.status = payment.status
    dto.providerStatus = payment.providerStatus
    dto.paymentType = payment.type
    dto.hash = payment.hash
    dto.safeHash = payment.safeHash
    if (payment.sourceWallet) dto.sourceWallet = WalletDto.map(payment.sourceWallet)
    dto.destinationAddress = payment.destinationAddress
    dto.destinationName = payment.destinationName
    dto.destinationMetadata = payment.destinationMetadata
      ? DestinationMetadataDto.map(payment.destinationMetadata)
      : null

    const sourceCryptocurrency = payment.sourceCryptocurrency
      ? CryptocurrencyResponseDto.map(payment.sourceCryptocurrency)
      : null
    dto.cryptocurrency = sourceCryptocurrency
    dto.sourceCryptocurrency = sourceCryptocurrency
    if (destinationCurrency) {
      switch (payment.destinationCurrencyType) {
        case CurrencyType.FIAT:
          dto.destinationCurrency = FiatCurrencyDetailedDto.map(destinationCurrency as FiatCurrency)
          break
        case CurrencyType.CRYPTO:
          dto.destinationCurrency = CryptocurrencyResponseDto.map(destinationCurrency as Cryptocurrency)
          break
      }
    } else {
      dto.destinationCurrency = null
    }
    dto.amount = payment.sourceAmount
    dto.sourceAmount = payment.sourceAmount
    dto.destinationCurrencyType = payment.destinationCurrencyType
    dto.destinationAmount = payment.destinationAmount
    if (payment.chartOfAccountId) {
      dto.chartOfAccount = chartofAccount
        ? ChartOfAccountDto.map(chartofAccount)
        : ChartOfAccountDto.map({ publicId: payment.chartOfAccountId })
    } else {
      dto.chartOfAccount = null
    }
    if (payment.annotationPublicIds?.length) {
      dto.annotations = annotations.map((annotation) => AnnotationDto.map(annotation))
    }
    if (payment.metadata) {
      dto.metadata = PaymentMetadataDto.map(payment.metadata)
    }
    dto.notes = payment.notes
    dto.remarks = payment.remarks
    dto.files = payment.files
    dto.createdAt = payment.createdAt
    dto.updatedAt = payment.lastUpdatedAt
    dto.reviewRequestedAt = payment.reviewRequestedAt
    dto.reviewedAt = payment.reviewedAt
    dto.executedAt = payment.executedAt
    dto.failedAt = payment.failedAt
    dto.createdBy = AccountDto.map(payment.createdBy)
    dto.updatedBy = AccountDto.map(payment.updatedBy)
    if (reviewer) {
      dto.reviewer = MemberDto.map(reviewer)
    } else {
      dto.reviewer = null
    }
    dto.reviewRequestedBy = payment.reviewRequestedBy
      ? AccountDto.map(payment.reviewRequestedBy)
      : payment.reviewRequestedBy
    dto.reviewedBy = payment.reviewedBy ? AccountDto.map(payment.reviewedBy) : payment.reviewedBy
    dto.executedBy = payment.executedBy ? AccountDto.map(payment.executedBy) : payment.executedBy
    return dto
  }
}
