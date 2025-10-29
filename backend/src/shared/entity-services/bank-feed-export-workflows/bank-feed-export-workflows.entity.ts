import { Column, Entity } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { IntegrationName } from '../integration/integration.entity'
import { BankFeedExportFileType, BankFeedExportStatus, BankFeedExportWorkflowMetadata } from './interface'

@Entity()
export class BankFeedExportWorkflow extends PublicEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column()
  name: string

  @Column()
  status: BankFeedExportStatus

  @Column({ name: 'integration_name' })
  integrationName: IntegrationName

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

  @Column({ name: 's3_file_path', nullable: true })
  s3FilePath: string

  @Column({ nullable: true })
  filename: string

  @Column({ name: 'file_type' })
  fileType: BankFeedExportFileType

  @Column({ type: 'json' })
  metadata: BankFeedExportWorkflowMetadata

  static create(params: {
    name: string
    integrationName: IntegrationName
    organizationId: string
    status: BankFeedExportStatus
    fileType: BankFeedExportFileType
    requestedBy: string
    cryptocurrencyId: string
    blockchainId: string
    walletId: string
    startTime: Date
    endTime: Date
  }): BankFeedExportWorkflow {
    const workflow = new BankFeedExportWorkflow()
    workflow.name = params.name
    workflow.integrationName = params.integrationName
    workflow.organizationId = params.organizationId
    workflow.status = params.status
    workflow.requestedBy = params.requestedBy ?? null
    workflow.fileType = params.fileType ?? BankFeedExportFileType.CSV
    workflow.metadata = {
      cryptocurrencyId: params.cryptocurrencyId,
      blockchainId: params.blockchainId,
      walletId: params.walletId,
      startTime: params.startTime,
      endTime: params.endTime
    }

    return workflow
  }
}
