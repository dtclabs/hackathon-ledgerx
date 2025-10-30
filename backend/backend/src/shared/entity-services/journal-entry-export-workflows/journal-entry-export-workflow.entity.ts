import { Column, Entity, OneToMany } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { IntegrationName } from '../integration/integration.entity'
import { JournalEntry } from '../journal-entries/journal-entry.entity'
import { JournalEntryExportStatus, JournalEntryExportType, JournalEntryExportWorkflowMetadata } from './interfaces'

@Entity()
export class JournalEntryExportWorkflow extends PublicEntity {
  @Column({ name: 'integration_name' })
  integrationName: IntegrationName

  @Column({ name: 'organization_id' })
  organizationId: string

  @Column()
  type: JournalEntryExportType

  @Column()
  status: JournalEntryExportStatus

  @Column({ type: 'json', nullable: true })
  error: any

  @Column({ name: 'requested_by', nullable: true })
  requestedBy: string

  @Column({ name: 'last_executed_at', nullable: true })
  lastExecutedAt: Date

  @Column({ name: 'total_count', nullable: true })
  totalCount: number

  @Column({ name: 'generated_successful_count', nullable: true })
  generatedSuccessfulCount: number

  @Column({ name: 'generated_failed_count', nullable: true })
  generatedFailedCount: number

  @Column({ name: 'exported_successful_count', nullable: true })
  exportedSuccessfulCount: number

  @Column({ name: 'exported_failed_count', nullable: true })
  exportedFailedCount: number

  @Column({ name: 'generated_at', nullable: true })
  generatedAt: Date

  @Column({ name: 'exported_at', nullable: true })
  exportedAt: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ type: 'json', nullable: true })
  metadata: JournalEntryExportWorkflowMetadata

  @OneToMany(() => JournalEntry, (journalEntry) => journalEntry.workflow)
  journalEntries: JournalEntry[]

  static create(params: {
    integrationName: IntegrationName
    organizationId: string
    type: JournalEntryExportType
    status: JournalEntryExportStatus
    requestedBy?: string
    financialTransactionParentIds?: string[]
  }): JournalEntryExportWorkflow {
    const workflow = new JournalEntryExportWorkflow()
    workflow.integrationName = params.integrationName
    workflow.organizationId = params.organizationId
    workflow.type = params.type
    workflow.status = params.status
    workflow.requestedBy = params.requestedBy ?? null
    workflow.metadata = {
      financialTransactionParentIds: params.financialTransactionParentIds ?? null
    }

    return workflow
  }
}
