import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThanOrEqual, Repository } from 'typeorm'
import { TaskStatusEnum } from '../../../core/events/event-types'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { IngestionProcess } from './ingestion-process.entity'
import { IngestionProcessMetadata } from './interfaces'

@Injectable()
export class IngestionProcessEntityService extends BaseEntityService<IngestionProcess> {
  constructor(
    @InjectRepository(IngestionProcess)
    private ingestionProcessRepository: Repository<IngestionProcess>
  ) {
    super(ingestionProcessRepository)
  }

  setFromBlock(ingestionProcess: IngestionProcess, fromBlock: string) {
    return this.ingestionProcessRepository.update(ingestionProcess.id, {
      metadata: {
        ...ingestionProcess.metadata,
        fromBlock
      }
    })
  }

  async updateMetadata(id: string, metadata: IngestionProcessMetadata): Promise<Partial<IngestionProcess>> {
    await this.ingestionProcessRepository.update(id, { metadata })
    return {
      metadata
    }
  }

  async changeStatus(
    id: string,
    status: TaskStatusEnum,
    error?: { messages: any[]; retryAt: Date; retryCount: number }
  ): Promise<TaskStatusEnum> {
    const updateData: Partial<IngestionProcess> = {
      status,
      error: error ?? undefined,
      lastExecutionAt: status === TaskStatusEnum.RUNNING ? dateHelper.getUTCTimestamp() : undefined,
      completedAt: status === TaskStatusEnum.COMPLETED ? dateHelper.getUTCTimestamp() : undefined
    }
    await this.ingestionProcessRepository.update(id, updateData)
    return status
  }

  async getFailed() {
    return this.find({
      where: [
        {
          status: TaskStatusEnum.FAILED
        },
        {
          status: TaskStatusEnum.RUNNING,
          lastExecutionAt: LessThanOrEqual(dateHelper.getUTCTimestampMinutesAgo(30))
        },
        {
          status: TaskStatusEnum.CREATED,
          createdAt: LessThanOrEqual(dateHelper.getUTCTimestampMinutesAgo(2))
        }
      ]
    })
  }

  async getByWorkflowId(ingestionWorkflowId: string) {
    return this.find({
      where: {
        ingestionWorkflow: {
          id: ingestionWorkflowId
        }
      }
    })
  }
}
