import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm'
import { Direction } from '../../../core/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { ExportWorkflow } from './export-workflow.entity'
import {
  ExportWorkflowFileType,
  ExportWorkflowMetadata,
  ExportWorkflowStatus,
  ExportWorkflowType,
  SpotBalanceExportWorkflowMetadata
} from './interface'

@Injectable()
export class ExportWorkflowsEntityService extends BaseEntityService<ExportWorkflow> {
  constructor(
    @InjectRepository(ExportWorkflow)
    private exportWorkflowRepository: Repository<ExportWorkflow>
  ) {
    super(exportWorkflowRepository)
  }

  getById(id: string, relations?: FindOptionsRelations<ExportWorkflow>) {
    return this.exportWorkflowRepository.findOne({ where: { id }, relations })
  }

  getRunningWorkflowsByOrganization(organizationId: string): Promise<ExportWorkflow[]> {
    return this.exportWorkflowRepository.find({
      where: {
        organizationId: organizationId,
        status: ExportWorkflowStatus.GENERATING
      }
    })
  }

  async createSpotBalanceWorkflow(params: {
    organizationId: string
    name: string
    requestedBy: string
    publicMetadata: SpotBalanceExportWorkflowMetadata
    privateMetadata: SpotBalanceExportWorkflowMetadata
    fileType: ExportWorkflowFileType
  }): Promise<ExportWorkflow> {
    return this.createWorkflow({
      ...params,
      type: ExportWorkflowType.SPOT_BALANCE
    })
  }

  private async createWorkflow(params: {
    organizationId: string
    name: string
    requestedBy: string
    type: ExportWorkflowType
    publicMetadata: ExportWorkflowMetadata
    privateMetadata: ExportWorkflowMetadata
    fileType: ExportWorkflowFileType
  }): Promise<ExportWorkflow> {
    const workflow = ExportWorkflow.create(params)
    return this.exportWorkflowRepository.save(workflow)
  }

  async changeStatus(id: string, status: ExportWorkflowStatus, additionalData?: Partial<ExportWorkflow>) {
    const tempDate = dateHelper.getUTCTimestamp()
    let updateData: Partial<ExportWorkflow> = {
      status,
      lastExecutedAt: tempDate,
      completedAt: status === ExportWorkflowStatus.COMPLETED ? tempDate : undefined
    }

    if (!!additionalData) {
      updateData = { ...updateData, ...additionalData }
    }

    return this.exportWorkflowRepository.update(id, updateData)
  }

  updateById(id: string, partialData: Partial<ExportWorkflow>) {
    return this.exportWorkflowRepository.update(id, partialData)
  }

  updateLastExecutedAt(id: string) {
    return this.exportWorkflowRepository.update(id, {
      lastExecutedAt: dateHelper.getUTCTimestamp()
    })
  }

  updateS3FileName(id: string, fileName: string) {
    return this.exportWorkflowRepository.update(id, { s3FileName: fileName })
  }

  async getByOrganization(params: { organizationId: string; limit: number; types: ExportWorkflowType[] }) {
    const whereConditions: FindOptionsWhere<ExportWorkflow> = {
      organizationId: params.organizationId,
      type: !!params.types?.length ? In(params.types) : undefined
    }

    return this.exportWorkflowRepository.find({
      where: whereConditions,
      order: { createdAt: Direction.DESC },
      take: params.limit
    })
  }
}
