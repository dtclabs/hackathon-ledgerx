import { Column, Entity } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { FinancialTransactionQueryParams } from '../../../financial-transactions/interfaces'
import {
  FinancialTransactionExportFileType,
  FinancialTransactionExportStatus,
  FinancialTransactionExportType,
  FinancialTransactionExportWorkflowMetadata
} from './interface'

@Entity()
export class FinancialTransactionExportWorkflow extends PublicEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column()
  type: FinancialTransactionExportType

  @Column()
  status: FinancialTransactionExportStatus

  @Column({ type: 'json', nullable: true })
  error: any

  @Column({ name: 'requested_by', nullable: true })
  requestedBy: string

  @Column({ name: 'total_count', nullable: true })
  totalCount: number

  @Column({ name: 'last_executed_at', nullable: true })
  lastExecutedAt: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ name: 's3_file_name', nullable: true })
  s3FileName: string

  @Column({ name: 'file_type' })
  fileType: FinancialTransactionExportFileType

  @Column({ type: 'json', nullable: true })
  metadata: FinancialTransactionExportWorkflowMetadata

  static create(params: {
    organizationId: string
    type: FinancialTransactionExportType
    status: FinancialTransactionExportStatus
    fileType: FinancialTransactionExportFileType
    requestedBy: string
    financialTransactionIds: string[]
    query: FinancialTransactionQueryParams
  }): FinancialTransactionExportWorkflow {
    const workflow = new FinancialTransactionExportWorkflow()
    workflow.organizationId = params.organizationId
    workflow.type = params.type
    workflow.status = params.status
    workflow.requestedBy = params.requestedBy ?? null
    workflow.fileType = params.fileType ?? FinancialTransactionExportFileType.CSV
    workflow.metadata = {
      financialTransactionIds: params.financialTransactionIds ?? null,
      query: params.query ?? null
    }

    return workflow
  }
}
