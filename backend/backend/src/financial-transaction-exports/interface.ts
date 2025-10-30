import { ApiProperty } from '@nestjs/swagger'
import {
  FinancialTransactionExportFileType,
  FinancialTransactionExportStatus,
  FinancialTransactionExportType
} from '../shared/entity-services/financial-transaction-export-workflows/interface'
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { FinancialTransactionQueryExportParams } from '../financial-transactions/interfaces'
import { FinancialTransactionExportWorkflow } from '../shared/entity-services/financial-transaction-export-workflows/financial-transaction-export-workflows.entity'
import { dateHelper } from '../shared/helpers/date.helper'

export class FinancialTransactionExportDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ enum: FinancialTransactionExportType })
  type: FinancialTransactionExportType

  @ApiProperty({ enum: FinancialTransactionExportStatus })
  status: FinancialTransactionExportStatus

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  updatedAt: Date

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  completedAt: Date

  @ApiProperty()
  totalCount: number

  @ApiProperty({ enum: FinancialTransactionExportFileType })
  fileType: FinancialTransactionExportFileType

  static map(financialTransactionExport: FinancialTransactionExportWorkflow): FinancialTransactionExportDto {
    const dto = new FinancialTransactionExportDto()
    dto.id = financialTransactionExport.publicId

    const transactionCount = `${financialTransactionExport.totalCount} ${
      financialTransactionExport.totalCount > 1 ? 'Transactions' : 'Transaction'
    }`

    dto.name = `${dateHelper.getShortDateFormat(financialTransactionExport.createdAt)}${
      financialTransactionExport.totalCount !== null ? ` - ${transactionCount}` : ''
    }`

    dto.type = financialTransactionExport.type
    dto.status = financialTransactionExport.status
    dto.fileType = financialTransactionExport.fileType
    dto.totalCount = financialTransactionExport.totalCount ?? 0
    dto.updatedAt = financialTransactionExport.updatedAt ?? null
    dto.completedAt = financialTransactionExport.completedAt ?? null

    return dto
  }
}

export class CreateFinancialTransactionExportDto {
  @IsNotEmpty()
  @ApiProperty({ enum: FinancialTransactionExportType })
  type: FinancialTransactionExportType

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiProperty({ isArray: true, description: 'Required when type is manual' })
  financialTransactionIds?: string[]

  @IsOptional()
  @ApiProperty()
  @ValidateNested()
  @Type(() => FinancialTransactionQueryExportParams)
  query?: FinancialTransactionQueryExportParams

  @IsOptional()
  @ApiProperty({ enum: FinancialTransactionExportFileType })
  fileType?: FinancialTransactionExportFileType
}

export enum FinancialTransactionExportEventType {
  GENERATE_FROM_FINANCIAL_TRANSACTION = 'financialTransactionExport.generateFromFinancialTransaction'
}

export const MAX_FINANCIAL_TRANSACTION_EXPORT_WORKFLOWS = 5
