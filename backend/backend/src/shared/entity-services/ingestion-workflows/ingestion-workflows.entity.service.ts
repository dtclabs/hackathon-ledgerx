import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThanOrEqual, Repository } from 'typeorm'
import { TaskStatusEnum } from '../../../core/events/event-types'
import { IngestionTaskMetadata, IngestionWorkflow } from './ingestion-workflow.entity'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'

export const MAX_RETRIES = 8

@Injectable()
export class IngestionWorkflowsEntityService extends BaseEntityService<IngestionWorkflow> {
  constructor(
    @InjectRepository(IngestionWorkflow)
    private ingestionWorkflowRepository: Repository<IngestionWorkflow>
  ) {
    super(ingestionWorkflowRepository)
  }

  async getOrCreate(ingestionTask: IngestionWorkflow) {
    const task = await this.findOne({
      where: {
        blockchainId: ingestionTask.blockchainId,
        address: ingestionTask.address,
        status: In([TaskStatusEnum.RUNNING, TaskStatusEnum.CREATED, TaskStatusEnum.FAILED])
      }
    })

    if (task) {
      return task
    }

    return this.create(ingestionTask)
  }

  async updateMetadata(id: string, meta: IngestionTaskMetadata): Promise<Partial<IngestionWorkflow>> {
    await this.ingestionWorkflowRepository.update(id, { metadata: meta })
    return {
      metadata: meta
    }
  }

  async changeStatus(
    id: string,
    status: TaskStatusEnum,
    error?: { messages: any[]; retryAt: Date; retryCount: number }
  ): Promise<TaskStatusEnum> {
    const updateData: Partial<IngestionWorkflow> = {
      status,
      error: error ?? undefined,
      lastExecutionAt: status === TaskStatusEnum.RUNNING ? dateHelper.getUTCTimestamp() : undefined,
      completedAt: status === TaskStatusEnum.COMPLETED ? dateHelper.getUTCTimestamp() : undefined
    }
    await this.ingestionWorkflowRepository.update(id, updateData)
    return status
  }

  async handleError(ingestionTask: IngestionWorkflow, error: Error | any) {
    const errorMessage = error.stack ?? error.toString() ?? error
    const messages = ingestionTask.error?.messages?.length
      ? [...ingestionTask.error.messages, errorMessage]
      : [errorMessage]

    if (ingestionTask.error?.retryCount >= MAX_RETRIES) {
      return this.changeStatus(ingestionTask.id, TaskStatusEnum.TERMINATED, {
        messages: messages,
        retryAt: null,
        retryCount: (ingestionTask.error?.retryCount ?? 0) + 1
      })
    } else {
      const backOffMilliseconds = 2 ** (ingestionTask.error?.retryCount ?? 0) * 1000 * 10
      console.log(`Backoff for ${ingestionTask.id} is ${backOffMilliseconds}ms`, {
        newDate: dateHelper.getUTCTimestamp(),
        next: new Date(dateHelper.getUTCTimestamp().getTime() + backOffMilliseconds)
      })

      return this.changeStatus(ingestionTask.id, TaskStatusEnum.FAILED, {
        messages: messages,
        retryAt: new Date(dateHelper.getUTCTimestamp().getTime() + backOffMilliseconds),
        retryCount: (ingestionTask.error?.retryCount ?? 0) + 1
      })
    }
  }

  getFailedIngestionTasks() {
    return this.find({
      where: [
        {
          status: TaskStatusEnum.FAILED
        },
        {
          status: TaskStatusEnum.RUNNING,
          lastExecutionAt: LessThanOrEqual(dateHelper.getUTCTimestampMinutesAgo(60))
        },
        {
          status: TaskStatusEnum.CREATED,
          createdAt: LessThanOrEqual(dateHelper.getUTCTimestampMinutesAgo(2))
        }
      ]
    })
  }

  getStuckForHoursTasks(hours: number) {
    const queryTimestamp = dateHelper.getUTCTimestampHoursAgo(hours)
    return this.ingestionWorkflowRepository.find({
      where: [
        {
          status: TaskStatusEnum.CREATED,
          createdAt: LessThanOrEqual(queryTimestamp)
        },
        {
          status: TaskStatusEnum.RUNNING,
          lastExecutionAt: LessThanOrEqual(queryTimestamp)
        },
        {
          status: TaskStatusEnum.TERMINATED
        }
      ]
    })
  }
}
