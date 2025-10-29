import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { ChartOfAccount } from '../chart-of-accounts/chart-of-account.entity'
import { JournalLineEntryType } from './interfaces'
import { JournalEntry } from './journal-entry.entity'

@Entity()
export class JournalLine extends BaseEntity {
  @ManyToOne(() => JournalEntry, (journalEntry) => journalEntry.journalLines)
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry

  @Column({ name: 'remote_id', nullable: true })
  remoteId: string

  // Always 2 decimal place. This can be negative and able to be used on its own.
  @Column({ name: 'net_amount' })
  netAmount: string

  // This is just informational.
  // Debit should have a positive netAmount
  // Credit should have a negative netAmount
  @Column({ name: 'entry_type', enum: JournalLineEntryType })
  entryType: JournalLineEntryType

  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'account_id' })
  account: ChartOfAccount

  @Column({ nullable: true })
  description: string

  @Column({ name: 'modified_at', nullable: true })
  modifiedAt: Date
}
