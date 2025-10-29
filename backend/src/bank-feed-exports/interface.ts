import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { BankFeedExportWorkflow } from '../shared/entity-services/bank-feed-export-workflows/bank-feed-export-workflows.entity'
import {
  BankFeedExportFileType,
  BankFeedExportStatus
} from '../shared/entity-services/bank-feed-export-workflows/interface'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import { dateHelper } from '../shared/helpers/date.helper'

export class BankFeedExportDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ enum: IntegrationName })
  integrationName: IntegrationName

  @ApiProperty({ enum: BankFeedExportStatus })
  status: BankFeedExportStatus

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  updatedAt: Date

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  completedAt: Date

  @ApiProperty()
  totalCount: number

  @ApiProperty()
  blockchainId: string

  @ApiProperty()
  walletId: string

  @ApiProperty()
  cryptocurrencyId: string

  @ApiProperty({ enum: BankFeedExportFileType })
  fileType: BankFeedExportFileType

  static map(bankFeedExport: BankFeedExportWorkflow): BankFeedExportDto {
    const dto = new BankFeedExportDto()

    dto.id = bankFeedExport.publicId
    dto.integrationName = bankFeedExport.integrationName
    dto.status = bankFeedExport.status
    dto.fileType = bankFeedExport.fileType
    dto.totalCount = bankFeedExport.totalCount ?? null
    dto.createdAt = bankFeedExport.createdAt ?? null
    dto.updatedAt = bankFeedExport.updatedAt ?? null
    dto.completedAt = bankFeedExport.completedAt ?? null
    dto.blockchainId = bankFeedExport.metadata.blockchainId ?? null
    dto.cryptocurrencyId = bankFeedExport.metadata.cryptocurrencyId ?? null
    dto.walletId = bankFeedExport.metadata.walletId ?? null

    return dto
  }
}

export class CreateBankFeedExportDto {
  @IsNotEmpty()
  @IsEnum(IntegrationName)
  @ApiProperty({ enum: IntegrationName })
  integrationName: IntegrationName

  @IsNotEmpty()
  @IsISO8601({ strict: true })
  @ApiProperty({ example: '2022-01-01' })
  startTime: Date

  @IsOptional()
  @IsISO8601({ strict: true })
  @ApiProperty({ example: '2023-01-01' })
  endTime: Date

  @IsNotEmpty()
  @ApiProperty({
    example: 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad'
  })
  walletId: string

  @IsNotEmpty()
  @IsArray()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiProperty({
    isArray: true,
    example: ['a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad', 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  cryptocurrencyIds: string[]

  @IsNotEmpty()
  @ApiProperty({
    example: SupportedBlockchains.ETHEREUM_MAINNET
  })
  @IsEnum(SupportedBlockchains)
  blockchainId: string

  @IsOptional()
  @ApiProperty({ enum: BankFeedExportFileType })
  fileType?: BankFeedExportFileType
}

export enum BankFeedExportEventType {
  GENERATE_FROM_FINANCIAL_TRANSACTION = 'bankFeedExport.generateFromFinancialTransaction'
}

export const MAX_BANK_FEED_EXPORT_WORKFLOWS_TO_DISPLAY = 10

export interface BankFeedExportLine {
  date: string
  amount: string
  payee: string
  account: string
  description: string
  reference: string
}

export enum AmountDirection {
  DEBIT = 'debit',
  CREDIT = 'credit'
}
