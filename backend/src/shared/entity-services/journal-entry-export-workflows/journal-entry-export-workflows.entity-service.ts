import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, FindOptionsWhere, In, LessThanOrEqual, Not, Repository } from 'typeorm'
import { Direction } from '../../../core/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { IntegrationName } from '../integration/integration.entity'
import { JOURNAL_ENTRY_EXPORT_TERMINAL_STATUSES, JournalEntryExportStatus, JournalEntryExportType } from './interfaces'
import { JournalEntryExportWorkflow } from './journal-entry-export-workflow.entity'

@Injectable()
export class JournalEntryExportWorkflowEntityService extends BaseEntityService<JournalEntryExportWorkflow> {
  constructor(
    @InjectRepository(JournalEntryExportWorkflow)
    private journalEntryExportWorkflowsRepository: Repository<JournalEntryExportWorkflow>
  ) {
    super(journalEntryExportWorkflowsRepository)
  }

  async createWorkflow(params: {
    organizationId: string
    requestedBy: string
    integrationName: IntegrationName
    type: JournalEntryExportType
    financialTransactionParentIds?: string[]
  }): Promise<JournalEntryExportWorkflow> {
    const workflow = JournalEntryExportWorkflow.create({
      organizationId: params.organizationId,
      integrationName: params.integrationName,
      type: params.type,
      status: JournalEntryExportStatus.GENERATING,
      requestedBy: params.requestedBy ?? null,
      financialTransactionParentIds: params.financialTransactionParentIds ?? null
    })

    return this.journalEntryExportWorkflowsRepository.save(workflow)
  }

  getById(id: string, relations?: FindOptionsRelations<JournalEntryExportWorkflow>) {
    return this.journalEntryExportWorkflowsRepository.findOne({ where: { id }, relations })
  }

  getRunningWorkflowsByOrganization(organizationId: string): Promise<JournalEntryExportWorkflow[]> {
    return this.journalEntryExportWorkflowsRepository.find({
      where: {
        organizationId: organizationId,
        status: Not(In(JOURNAL_ENTRY_EXPORT_TERMINAL_STATUSES))
      }
    })
  }

  getJournalEntryExportWorkflowByOrganizationAndPublicIdAndStatus(
    organizationId: string,
    publicId: string,
    status?: JournalEntryExportStatus,
    relations?: FindOptionsRelations<JournalEntryExportWorkflow>
  ): Promise<JournalEntryExportWorkflow> {
    const whereConditions: FindOptionsWhere<JournalEntryExportWorkflow> = {
      organizationId: organizationId,
      publicId: publicId
    }

    if (status) {
      whereConditions.status = status
    }

    return this.journalEntryExportWorkflowsRepository.findOne({
      where: whereConditions,
      relations
    })
  }

  getJournalEntryExportWorkflowsByOrganization(params: {
    organizationId: string
    integrationName?: IntegrationName
    statuses?: JournalEntryExportStatus[]
    relations?: FindOptionsRelations<JournalEntryExportWorkflow>
  }): Promise<JournalEntryExportWorkflow[]> {
    const whereConditions: FindOptionsWhere<JournalEntryExportWorkflow> = { organizationId: params.organizationId }

    if (params.integrationName) {
      whereConditions.integrationName = params.integrationName
    }

    if (params.statuses) {
      whereConditions.status = In(params.statuses)
    }

    return this.journalEntryExportWorkflowsRepository.find({
      where: whereConditions,
      order: { id: Direction.DESC },
      relations: params.relations
    })
  }

  updateLastExecutedAt(id: string) {
    return this.journalEntryExportWorkflowsRepository.update(id, { lastExecutedAt: dateHelper.getUTCTimestamp() })
  }

  updateGeneratedAt(id: string) {
    return this.journalEntryExportWorkflowsRepository.update(id, { generatedAt: dateHelper.getUTCTimestamp() })
  }

  updateExportedAt(id: string) {
    return this.journalEntryExportWorkflowsRepository.update(id, { exportedAt: dateHelper.getUTCTimestamp() })
  }

  async changeStatus(
    id: string,
    status: JournalEntryExportStatus,
    additionalData?: Partial<JournalEntryExportWorkflow>
  ) {
    const tempDate = dateHelper.getUTCTimestamp()
    let updateData: Partial<JournalEntryExportWorkflow> = {
      status,
      lastExecutedAt: tempDate,
      completedAt: status === JournalEntryExportStatus.COMPLETED ? tempDate : undefined
    }

    if (!!additionalData) {
      updateData = { ...updateData, ...additionalData }
    }

    return this.journalEntryExportWorkflowsRepository.update(id, updateData)
  }

  async updateError(id: string, e: any) {
    return this.journalEntryExportWorkflowsRepository.update(id, { error: e })
  }

  getExportingWorkflows(minutes: number) {
    const queryTimestamp = dateHelper.getUTCTimestampMinutesAgo(minutes)

    return this.journalEntryExportWorkflowsRepository.find({
      where: { status: JournalEntryExportStatus.EXPORTING, lastExecutedAt: LessThanOrEqual(queryTimestamp) }
    })
  }

  updateById(id: string, partialData: Partial<JournalEntryExportWorkflow>) {
    return this.journalEntryExportWorkflowsRepository.update(id, partialData)
  }

  updateStatusById(id: string, status: JournalEntryExportStatus) {
    return this.journalEntryExportWorkflowsRepository.update(id, { status })
  }

  softDeleteByJournalEntryWorkflowIds(journalEntryWorkflowIds: string[]) {
    return this.journalEntryExportWorkflowsRepository.softDelete({ id: In(journalEntryWorkflowIds) })
  }
}
