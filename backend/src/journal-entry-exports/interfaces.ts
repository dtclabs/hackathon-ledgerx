import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'
import { FinancialTransactionQueryExportParams } from '../financial-transactions/interfaces'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import {
  JournalEntryExportStatus,
  JournalEntryExportType
} from '../shared/entity-services/journal-entry-export-workflows/interfaces'
import { JournalEntryExportWorkflow } from '../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflow.entity'
import { dateHelper } from '../shared/helpers/date.helper'

export class JournalEntryExportDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ enum: IntegrationName })
  integrationName: IntegrationName

  @ApiProperty({ enum: JournalEntryExportType })
  type: JournalEntryExportType

  @ApiProperty({ enum: JournalEntryExportStatus })
  status: JournalEntryExportStatus

  @ApiProperty({ type: Date, example: '2022-01-08T19:00:49.000Z' })
  updatedAt: Date

  @ApiProperty({ type: Date, example: '2022-01-08T19:00:49.000Z' })
  generatedAt: Date

  @ApiProperty({ type: Date, example: '2022-01-08T19:00:49.000Z' })
  completedAt: Date

  @ApiProperty()
  totalCount: number

  @ApiProperty()
  generatedSuccessfulCount: number

  @ApiProperty()
  generatedFailedCount: number

  @ApiProperty()
  exportedSuccessfulCount: number

  @ApiProperty()
  exportedFailedCount: number

  static map(journalEntryExport: JournalEntryExportWorkflow): JournalEntryExportDto {
    const dto = new JournalEntryExportDto()
    dto.id = journalEntryExport.publicId

    //name generation

    const transactionCount = `${journalEntryExport.totalCount ?? '0'} ${
      journalEntryExport.totalCount > 1 ? 'Transactions' : 'Transaction'
    } `

    dto.name = `${dateHelper.getShortDateFormat(journalEntryExport.createdAt)} - ${transactionCount}`

    dto.type = journalEntryExport.type
    dto.status = journalEntryExport.status
    dto.integrationName = journalEntryExport.integrationName
    dto.totalCount = journalEntryExport.totalCount ?? 0
    dto.generatedSuccessfulCount = journalEntryExport.generatedSuccessfulCount ?? 0
    dto.generatedFailedCount = journalEntryExport.generatedFailedCount ?? 0
    dto.exportedSuccessfulCount = journalEntryExport.exportedSuccessfulCount ?? 0
    dto.exportedFailedCount = journalEntryExport.exportedFailedCount ?? 0
    dto.updatedAt = journalEntryExport.updatedAt ?? null
    dto.generatedAt = journalEntryExport.generatedAt ?? null
    dto.completedAt = journalEntryExport.completedAt ?? null

    return dto
  }
}
export class GetJournalEntryExportQueryParams {
  @IsOptional()
  @IsEnum(IntegrationName)
  @ApiProperty({
    enum: IntegrationName,
    required: false
  })
  integrationName?: IntegrationName

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum([JournalEntryExportStatus.COMPLETED, JournalEntryExportStatus.EXPORTING], { each: true })
  @ApiProperty({
    isArray: true,
    enum: JournalEntryExportStatus,
    example: [JournalEntryExportStatus.COMPLETED, JournalEntryExportStatus.EXPORTING],
    required: false
  })
  statuses?: JournalEntryExportStatus[]
}

export class CreateJournalEntryExportDto {
  @IsNotEmpty()
  @IsEnum(IntegrationName)
  @ApiProperty({ enum: IntegrationName })
  integrationName: IntegrationName

  @IsNotEmpty()
  @IsEnum(JournalEntryExportType)
  @ApiProperty({ enum: JournalEntryExportType })
  type: JournalEntryExportType

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiProperty({ isArray: true, description: 'Required when type is manual' })
  financialTransactionParentIds?: string[]

  @IsOptional()
  @ApiProperty()
  @ValidateNested()
  @Type(() => FinancialTransactionQueryExportParams)
  queryParams?: FinancialTransactionQueryExportParams
}
