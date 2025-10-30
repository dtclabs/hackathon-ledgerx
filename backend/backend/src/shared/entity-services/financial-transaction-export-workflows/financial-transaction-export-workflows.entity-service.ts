import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm'
import { Direction } from '../../../core/interfaces'
import { FinancialTransactionQueryParams } from '../../../financial-transactions/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { FinancialTransactionExportWorkflow } from './financial-transaction-export-workflows.entity'
import {
  FinancialTransactionExportFileType,
  FinancialTransactionExportStatus,
  FinancialTransactionExportType
} from './interface'

@Injectable()
export class FinancialTransactionExportWorkflowEntityService extends BaseEntityService<FinancialTransactionExportWorkflow> {
  constructor(
    @InjectRepository(FinancialTransactionExportWorkflow)
    private financialTransactionExportWorkflowsRepository: Repository<FinancialTransactionExportWorkflow>
  ) {
    super(financialTransactionExportWorkflowsRepository)
  }

  getById(id: string, relations?: FindOptionsRelations<FinancialTransactionExportWorkflow>) {
    return this.financialTransactionExportWorkflowsRepository.findOne({ where: { id }, relations })
  }

  getFinancialTransactionExportWorkflowsByOrganization(params: {
    organizationId: string
    statuses?: FinancialTransactionExportStatus[]
  }): Promise<FinancialTransactionExportWorkflow[]> {
    const whereConditions: FindOptionsWhere<FinancialTransactionExportWorkflow> = {
      organizationId: params.organizationId
    }

    if (params.statuses) {
      whereConditions.status = In(params.statuses)
    }

    return this.financialTransactionExportWorkflowsRepository.find({
      where: whereConditions,
      order: { id: Direction.DESC }
    })
  }

  getRunningWorkflowsByOrganization(organizationId: string): Promise<FinancialTransactionExportWorkflow[]> {
    return this.financialTransactionExportWorkflowsRepository.find({
      where: {
        organizationId: organizationId,
        status: FinancialTransactionExportStatus.GENERATING
      }
    })
  }

  async createWorkflow(params: {
    organizationId: string
    requestedBy: string
    type: FinancialTransactionExportType
    fileType: FinancialTransactionExportFileType
    financialTransactionIds: string[]
    query: FinancialTransactionQueryParams
  }): Promise<FinancialTransactionExportWorkflow> {
    const workflow = FinancialTransactionExportWorkflow.create({
      organizationId: params.organizationId,
      type: params.type,
      status: FinancialTransactionExportStatus.GENERATING,
      requestedBy: params.requestedBy ?? null,
      financialTransactionIds: params.financialTransactionIds ?? null,
      fileType: params.fileType ?? FinancialTransactionExportFileType.CSV,
      query: params.query ?? null
    })

    return this.financialTransactionExportWorkflowsRepository.save(workflow)
  }

  async changeStatus(
    id: string,
    status: FinancialTransactionExportStatus,
    additionalData?: Partial<FinancialTransactionExportWorkflow>
  ) {
    const tempDate = dateHelper.getUTCTimestamp()
    let updateData: Partial<FinancialTransactionExportWorkflow> = {
      status,
      lastExecutedAt: tempDate,
      completedAt: status === FinancialTransactionExportStatus.COMPLETED ? tempDate : undefined
    }

    if (!!additionalData) {
      updateData = { ...updateData, ...additionalData }
    }

    return this.financialTransactionExportWorkflowsRepository.update(id, updateData)
  }

  updateById(id: string, partialData: Partial<FinancialTransactionExportWorkflow>) {
    return this.financialTransactionExportWorkflowsRepository.update(id, partialData)
  }

  updateLastExecutedAt(id: string) {
    return this.financialTransactionExportWorkflowsRepository.update(id, {
      lastExecutedAt: dateHelper.getUTCTimestamp()
    })
  }

  updateS3FileName(id: string, fileName: string) {
    return this.financialTransactionExportWorkflowsRepository.update(id, { s3FileName: fileName })
  }
}
