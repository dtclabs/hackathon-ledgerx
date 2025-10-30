import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { BankFeedExportFileType } from '../shared/entity-services/bank-feed-export-workflows/interface'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import {
  ExportWorkflowFileType,
  ExportWorkflowMetadata,
  ExportWorkflowStatus,
  ExportWorkflowType,
  SpotBalanceInterval
} from '../shared/entity-services/export-workflows/interface'
import { Type } from 'class-transformer'
import { ExportWorkflow } from '../shared/entity-services/export-workflows/export-workflow.entity'
import { IsLaterThanOrEqual } from '../shared/decorators/validators/validators'

export class ExportWorkflowDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ enum: IntegrationName })
  integrationName: IntegrationName

  @ApiProperty({ enum: ExportWorkflowType })
  type: ExportWorkflowType

  @ApiProperty({ enum: ExportWorkflowStatus })
  status: ExportWorkflowStatus

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  updatedAt: Date

  @ApiProperty({ type: Date, example: '2023-10-01T00:00:00.000Z' })
  completedAt: Date

  @ApiProperty()
  totalCount: number

  @ApiProperty({ enum: BankFeedExportFileType })
  fileType: ExportWorkflowFileType

  @ApiProperty()
  metadata: ExportWorkflowMetadata

  static map(exportWorkflow: ExportWorkflow): ExportWorkflowDto {
    const dto = new ExportWorkflowDto()

    dto.id = exportWorkflow.publicId
    dto.status = exportWorkflow.status
    dto.fileType = exportWorkflow.fileType
    dto.name = exportWorkflow.name
    dto.type = exportWorkflow.type
    dto.totalCount = exportWorkflow.totalCount ?? null
    dto.createdAt = exportWorkflow.createdAt ?? null
    dto.updatedAt = exportWorkflow.updatedAt ?? null
    dto.completedAt = exportWorkflow.completedAt ?? null
    dto.metadata = exportWorkflow.publicMetadata

    return dto
  }
}

export class GetExportWorkflowsQueryParams {
  @IsOptional()
  @ToArray()
  @IsEnum(ExportWorkflowType, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: ExportWorkflowType,
    example: [ExportWorkflowType.SPOT_BALANCE]
  })
  types?: ExportWorkflowType[]

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ maximum: 100, minimum: 1, example: 10 })
  size?: number
}

export class CreateSpotBalanceExportWorkflowDto {
  @IsNotEmpty()
  @IsISO8601({ strict: true })
  @ApiProperty({ example: '2022-01-01' })
  startDate: string

  @IsNotEmpty()
  @IsISO8601({ strict: true })
  @IsLaterThanOrEqual('startDate', { message: 'endDate must be later than startDate' })
  @ApiProperty({ example: '2023-01-01' })
  endDate: string

  @IsNotEmpty()
  @IsEnum(SpotBalanceInterval)
  @ApiProperty({
    enum: SpotBalanceInterval,
    example: SpotBalanceInterval.MONTHLY
  })
  interval: SpotBalanceInterval

  @IsOptional()
  @IsArray()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad', 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  walletIds: string[]

  @IsOptional()
  @IsArray()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad', 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  cryptocurrencyIds: string[]

  @IsOptional()
  @ToArray()
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainIds?: string[]

  @IsOptional()
  @ApiProperty({ enum: ExportWorkflowFileType })
  fileType?: ExportWorkflowFileType
}
