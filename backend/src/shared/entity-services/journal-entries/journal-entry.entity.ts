import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { FinancialTransactionParent } from '../financial-transactions/financial-transaction-parent.entity'
import { JournalEntryExportWorkflow } from '../journal-entry-export-workflows/journal-entry-export-workflow.entity'
import { Organization } from '../organizations/organization.entity'
import { JournalEntryIntegrationParams, JournalEntryStatus } from './interfaces'
import { JournalLine } from './journal-line.entity'

@Entity()
export class JournalEntry extends BaseEntity {
  @ManyToOne(() => FinancialTransactionParent)
  @JoinColumn({ name: 'financial_transaction_parent_id' })
  financialTransactionParent: FinancialTransactionParent

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'remote_id', nullable: true })
  remoteId: string

  @Column({ name: 'remote_created_at', nullable: true })
  remoteCreatedAt: Date

  @Column()
  status: JournalEntryStatus

  @Column({ name: 'status_reason', nullable: true })
  statusReason: string

  @Column({ name: 'transaction_date', nullable: true })
  transactionDate: Date

  @Column({ nullable: true })
  memo: string

  @Column({ name: 'integration_params', type: 'json', nullable: true })
  integrationParams: JournalEntryIntegrationParams

  @OneToMany(() => JournalLine, (journalLine) => journalLine.journalEntry)
  journalLines: JournalLine[]

  @ManyToOne(() => JournalEntryExportWorkflow, (workflow) => workflow.journalEntries)
  @JoinColumn({ name: 'workflow_id' })
  workflow: JournalEntryExportWorkflow
}
