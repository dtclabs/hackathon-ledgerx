import { Column, Entity } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { ExportWorkflowFileType, ExportWorkflowMetadata, ExportWorkflowStatus, ExportWorkflowType } from './interface'

@Entity()
export class ExportWorkflow extends PublicEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column()
  type: ExportWorkflowType

  @Column()
  status: ExportWorkflowStatus

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

  @Column({ name: 'name' })
  name: string

  @Column({ name: 'file_type' })
  fileType: ExportWorkflowFileType

  @Column({ name: 'public_metadata', type: 'json', nullable: true })
  publicMetadata: ExportWorkflowMetadata

  @Column({ name: 'private_metadata', type: 'json', nullable: true })
  privateMetadata: ExportWorkflowMetadata

  static create(params: {
    organizationId: string
    type: ExportWorkflowType
    fileType: ExportWorkflowFileType
    requestedBy: string
    name: string
    publicMetadata: ExportWorkflowMetadata
    privateMetadata: ExportWorkflowMetadata
  }): ExportWorkflow {
    const workflow = new ExportWorkflow()
    workflow.organizationId = params.organizationId
    workflow.type = params.type
    workflow.name = params.name
    workflow.status = ExportWorkflowStatus.CREATED
    workflow.requestedBy = params.requestedBy ?? null
    workflow.fileType = params.fileType ?? ExportWorkflowFileType.CSV
    workflow.publicMetadata = params.publicMetadata ?? null
    workflow.privateMetadata = params.privateMetadata ?? null

    return workflow
  }
}
