import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Invoice } from '../invoices/invoice.entity'
import { JournalEntry } from '../journal-entries/journal-entry.entity'
import { FinancialTransactionChild } from './financial-transaction-child.entity'
import {
  CreateFinancialTransactionParentDto,
  FinancialTransactionParentActivity,
  FinancialTransactionParentExportStatus,
  FinancialTransactionParentStatus
} from './interfaces'

@Entity()
@Index('UQ_financial_transaction_parent_publicId_organizationId', ['publicId', 'organizationId'], {
  unique: true,
  where: `"deleted_at" IS NULL`
})
@Index('IDX_financial_transaction_parent_organizationId_exportStatus', ['organizationId', 'exportStatus'], {
  where: `"deleted_at" IS NULL`
})
export class FinancialTransactionParent extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  hash: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column()
  activity: FinancialTransactionParentActivity

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string

  @Column()
  status: FinancialTransactionParentStatus

  @Column({ name: 'export_status' })
  exportStatus: FinancialTransactionParentExportStatus

  @Column({ name: 'export_status_reason', nullable: true })
  exportStatusReason: string

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date

  @OneToMany(
    () => FinancialTransactionChild,
    (financialTransactionChild) => financialTransactionChild.financialTransactionParent
  )
  financialTransactionChild: FinancialTransactionChild[]

  @OneToMany(() => JournalEntry, (journalEntry) => journalEntry.financialTransactionParent)
  journalEntries: JournalEntry[]

  @OneToMany(() => Invoice, (invoice) => invoice.financialTransactionParent)
  invoices: Invoice[]

  @Column({ nullable: true })
  remark: string

  static createFromDto(dto: CreateFinancialTransactionParentDto): FinancialTransactionParent {
    const financialTransactionParent = new FinancialTransactionParent()

    financialTransactionParent.publicId = dto.hash
    financialTransactionParent.hash = dto.hash
    financialTransactionParent.blockchainId = dto.blockchainId
    financialTransactionParent.activity = dto.activity
    financialTransactionParent.organizationId = dto.organizationId
    financialTransactionParent.status = dto.status
    financialTransactionParent.exportStatus = FinancialTransactionParentExportStatus.UNEXPORTED
    financialTransactionParent.valueTimestamp = dto.valueTimestamp
    return financialTransactionParent
  }
}
