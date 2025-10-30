import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm'
import { Direction } from '../../../core/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { IntegrationName } from '../integration/integration.entity'
import { BankFeedExportWorkflow } from './bank-feed-export-workflows.entity'
import { BankFeedExportFileType, BankFeedExportStatus } from './interface'

@Injectable()
export class BankFeedExportWorkflowEntityService extends BaseEntityService<BankFeedExportWorkflow> {
  constructor(
    @InjectRepository(BankFeedExportWorkflow)
    private bankFeedExportWorkflowsRepository: Repository<BankFeedExportWorkflow>
  ) {
    super(bankFeedExportWorkflowsRepository)
  }

  getById(id: string, relations?: FindOptionsRelations<BankFeedExportWorkflow>) {
    return this.bankFeedExportWorkflowsRepository.findOne({ where: { id }, relations })
  }

  getBankFeedExportWorkflowsByOrganization(params: {
    organizationId: string
    statuses?: BankFeedExportStatus[]
  }): Promise<BankFeedExportWorkflow[]> {
    const whereConditions: FindOptionsWhere<BankFeedExportWorkflow> = {
      organizationId: params.organizationId
    }

    if (params.statuses) {
      whereConditions.status = In(params.statuses)
    }

    return this.bankFeedExportWorkflowsRepository.find({
      where: whereConditions,
      order: { id: Direction.DESC }
    })
  }

  getRunningWorkflowsByOrganization(organizationId: string): Promise<BankFeedExportWorkflow[]> {
    return this.bankFeedExportWorkflowsRepository.find({
      where: {
        organizationId: organizationId,
        status: BankFeedExportStatus.GENERATING
      }
    })
  }

  async createWorkflow(params: {
    organizationId: string
    name: string
    integrationName: IntegrationName
    requestedBy: string
    fileType: BankFeedExportFileType
    blockchainId: string
    walletId: string
    cryptocurrencyId: string
    startTime: Date
    endTime: Date
  }): Promise<BankFeedExportWorkflow> {
    const workflow = BankFeedExportWorkflow.create({
      name: params.name,
      organizationId: params.organizationId,
      integrationName: params.integrationName,
      status: BankFeedExportStatus.GENERATING,
      requestedBy: params.requestedBy ?? null,
      fileType: params.fileType ?? BankFeedExportFileType.CSV,
      walletId: params.walletId,
      blockchainId: params.blockchainId,
      cryptocurrencyId: params.cryptocurrencyId,
      startTime: params.startTime,
      endTime: params.endTime
    })

    return this.bankFeedExportWorkflowsRepository.save(workflow)
  }

  async changeStatus(id: string, status: BankFeedExportStatus, additionalData?: Partial<BankFeedExportWorkflow>) {
    const tempDate = dateHelper.getUTCTimestamp()
    let updateData: Partial<BankFeedExportWorkflow> = {
      status,
      lastExecutedAt: tempDate,
      completedAt: status === BankFeedExportStatus.COMPLETED ? tempDate : undefined
    }

    if (!!additionalData) {
      updateData = { ...updateData, ...additionalData }
    }

    return this.bankFeedExportWorkflowsRepository.update(id, updateData)
  }

  updateById(id: string, partialData: Partial<BankFeedExportWorkflow>) {
    return this.bankFeedExportWorkflowsRepository.update(id, partialData)
  }

  updateLastExecutedAt(id: string) {
    return this.bankFeedExportWorkflowsRepository.update(id, {
      lastExecutedAt: dateHelper.getUTCTimestamp()
    })
  }

  updateS3FilePath(id: string, s3FilePath: string) {
    return this.bankFeedExportWorkflowsRepository.update(id, { s3FilePath: s3FilePath })
  }

  updateFilename(id: string, filename: string) {
    return this.bankFeedExportWorkflowsRepository.update(id, { filename: filename })
  }
}
