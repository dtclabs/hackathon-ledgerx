import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Decimal from 'decimal.js'
import { DeepPartial, In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { JournalEntryStatus, JournalEntryStatusReason, JournalLineEntryType } from './interfaces'
import { JournalEntry } from './journal-entry.entity'
import { JournalLine } from './journal-line.entity'

@Injectable()
export class JournalEntriesEntityService extends BaseEntityService<JournalEntry> {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,

    @InjectRepository(JournalLine)
    private journalLinesRepository: Repository<JournalLine>
  ) {
    super(journalEntriesRepository)
  }

  findJournalLineByJournalEntryId(journalEntryId: string) {
    return this.journalLinesRepository.find({
      where: { journalEntry: { id: journalEntryId } },
      relations: { account: true }
    })
  }

  initializeJournalEntryForParents(params: {
    parentIds: string[]
    organizationId: string
    workflowId: string
  }): Promise<JournalEntry[]> {
    const journalEntries: DeepPartial<JournalEntry>[] = []

    for (const parentId of params.parentIds) {
      const journalEntry: DeepPartial<JournalEntry> = {}
      journalEntry.financialTransactionParent = { id: parentId }
      journalEntry.organization = { id: params.organizationId }
      journalEntry.status = JournalEntryStatus.CREATED
      journalEntry.workflow = { id: params.workflowId }
      journalEntries.push(journalEntry)
    }

    return this.journalEntriesRepository.save(journalEntries)
  }

  updateById(id: string, payload: Partial<JournalEntry>) {
    return this.journalEntriesRepository.update(id, payload)
  }

  updateJournalEntryWithStatusAndStatusReason(
    id: string,
    status: JournalEntryStatus,
    statusReason?: JournalEntryStatusReason
  ) {
    return this.journalEntriesRepository.update(id, { status, statusReason: statusReason ?? null })
  }

  createJournalLineTemplate(params: {
    journalEntryId: string
    amount: string
    entryType: JournalLineEntryType
    chartOfAccountId: string
    description?: string
  }): DeepPartial<JournalLine> {
    const journalLineTemplate: DeepPartial<JournalLine> = {}

    const multiplier = params.entryType === JournalLineEntryType.DEBIT ? new Decimal(1) : new Decimal(-1)
    journalLineTemplate.netAmount = multiplier.mul(params.amount).toDecimalPlaces(2).toString()
    journalLineTemplate.entryType = params.entryType

    journalLineTemplate.journalEntry = { id: params.journalEntryId }
    journalLineTemplate.account = { id: params.chartOfAccountId }
    journalLineTemplate.description = params.description ?? null

    return journalLineTemplate
  }

  saveJournalLineTemplates(templates: DeepPartial<JournalLine>[]) {
    return this.journalLinesRepository.save(templates)
  }

  async softDeleteByJournalEntryIds(journalEntryIds: string[]) {
    await this.journalLinesRepository.softDelete({ journalEntry: { id: In(journalEntryIds) } })
    await this.journalEntriesRepository.softDelete({ id: In(journalEntryIds) })
  }

  getJournalEntriesByOrganizationId(organizationId: string) {
    return this.journalEntriesRepository.find({
      where: { organization: { id: organizationId } },
      relations: { organization: true }
    })
  }
}
