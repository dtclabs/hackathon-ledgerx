import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator'
import {
  ChartOfAccount,
  COASource,
  COASourceStatus,
  COAType
} from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { DeepPartial } from 'typeorm'
import { ModifiedAccount } from '../domain/integrations/accounting/interfaces'
export class ChartOfAccountDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({
    minLength: 1,
    maxLength: 10
  })
  code: string

  @ApiProperty({ enum: COAType })
  type: COAType

  @ApiProperty({ nullable: true })
  description: string

  @ApiProperty({ enum: COASource })
  source: COASource

  @ApiProperty({ enum: COASourceStatus })
  status: COASourceStatus

  static map(chartOfAccount: DeepPartial<ChartOfAccount>): ChartOfAccountDto {
    const result = new ChartOfAccountDto()
    result.id = chartOfAccount.publicId
    result.name = chartOfAccount.name
    result.code = chartOfAccount.code
    result.type = chartOfAccount.type
    result.description = chartOfAccount.description ?? null
    result.status = chartOfAccount.status
    return result
  }
}

export class ChartOfAccountQueryParams {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(COASourceStatus, { each: true })
  @ApiProperty({
    isArray: true,
    example: [COASourceStatus.ACTIVE],
    required: false
  })
  statuses?: COASourceStatus[]
}

export class ChartOfAccountWithCountDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  chartOfAccount: ChartOfAccountDto

  @ApiProperty()
  count: number

  static map(chartOfAccount: ChartOfAccount, count: number): ChartOfAccountWithCountDto {
    const result = new ChartOfAccountWithCountDto()
    result.chartOfAccount = ChartOfAccountDto.map(chartOfAccount)
    result.count = count
    return result
  }
}

export class ChartOfAccountSelectionDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({
    minLength: 1,
    maxLength: 10
  })
  code: string

  @ApiProperty({ enum: COAType })
  type: COAType

  @ApiProperty({ type: Boolean })
  isSelectable: boolean

  static map(chartOfAccount: ChartOfAccount, selectionStatus: boolean): ChartOfAccountSelectionDto {
    const result = new ChartOfAccountSelectionDto()
    result.id = chartOfAccount.publicId
    result.name = chartOfAccount.name
    result.code = chartOfAccount.code
    result.type = chartOfAccount.type
    result.isSelectable = selectionStatus
    return result
  }
}

export class CreateChartOfAccountDto {
  @IsNotEmpty()
  @Length(1, 10)
  @ApiProperty({
    minLength: 1,
    maxLength: 10,
    description: 'Chart of account that has not been used by the organization'
  })
  code: string

  @IsNotEmpty()
  @IsString()
  @Length(1, 150)
  @ApiProperty({ minimum: 1, maximum: 150 })
  name: string

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @ApiProperty({ minimum: 0, maximum: 1000 })
  description: string

  @IsNotEmpty()
  @IsEnum(COAType)
  @ApiProperty()
  type: COAType
}

export class MergeAccountIdDTO {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Merge account id of selected COA',
    example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4'
  })
  mergeAccountid: string
}
export class ImportSyncNewSaveDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MergeAccountIdDTO)
  @ApiProperty({
    description: 'Merge account id of selected COA',
    example: '[{"mergeAccountid": "ecbe05ac-62a3-46c5-ab31-4b478b37d1b4"}]',
    isArray: true,
    type: MergeAccountIdDTO
  })
  COAData: MergeAccountIdDTO[]
}

export class SaveSyncMigrationDataDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of previous COA',
    example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4'
  })
  previousCOAId: string

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'Id of new COA',
    example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4'
  })
  newCOAId: string
}

export class SyncResponseDTO {
  @ApiProperty({ type: ModifiedAccount, isArray: true })
  modifiedCOA: ModifiedAccount[]

  @ApiProperty({ type: ChartOfAccountWithCountDto, isArray: true })
  archivedCOA: ChartOfAccountWithCountDto[]

  @ApiProperty({ type: ChartOfAccountWithCountDto, isArray: true })
  deletedCOA: ChartOfAccountWithCountDto[]

  @ApiProperty({ type: ChartOfAccountWithCountDto, isArray: true })
  restoredCOA: ChartOfAccountWithCountDto[]

  static map(params: {
    modifiedCOA: ModifiedAccount[]
    archivedCOA: ChartOfAccountWithCountDto[]
    deletedCOA: ChartOfAccountWithCountDto[]
    restoredCOA: ChartOfAccountWithCountDto[]
  }): SyncResponseDTO {
    const dto = new SyncResponseDTO()
    dto.archivedCOA = params.archivedCOA
    dto.modifiedCOA = params.modifiedCOA
    dto.deletedCOA = params.deletedCOA
    dto.restoredCOA = params.restoredCOA
    return dto
  }
}

export class IdDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of selected COA',
    example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4'
  })
  id: string
}
export class SyncSaveDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MergeAccountIdDTO)
  @ApiProperty({
    example: '[{"mergeAccountid": "ecbe05ac-62a3-46c5-ab31-4b478b37d1b4"}]',
    isArray: true,
    type: MergeAccountIdDTO
  })
  modifiedData: MergeAccountIdDTO[]

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdDTO)
  @ApiProperty({
    example: '[{"id": "ecbe05ac-62a3-46c5-ab31-4b478b37d1b4"}]',
    isArray: true,
    type: IdDTO
  })
  restoredData: IdDTO[]

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveSyncMigrationDataDTO)
  @ApiProperty({
    isArray: true,
    type: SaveSyncMigrationDataDTO
  })
  archivedData: SaveSyncMigrationDataDTO[]

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveSyncMigrationDataDTO)
  @ApiProperty({
    isArray: true,
    type: SaveSyncMigrationDataDTO
  })
  deletedData: SaveSyncMigrationDataDTO[]
}

export const COA_SYNC_LIMIT_IN_SECONDS = 15
