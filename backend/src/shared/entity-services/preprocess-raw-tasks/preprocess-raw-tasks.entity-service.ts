import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThanOrEqual, Repository } from 'typeorm'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { Direction } from '../../../core/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { PreprocessRawTask, PreprocessRawTaskMetadata } from './preprocess-raw-task.entity'

@Injectable()
export class PreprocessRawTasksEntityService extends BaseEntityService<PreprocessRawTask> {
  constructor(
    @InjectRepository(PreprocessRawTask)
    private preprocessRawTaskRepository: Repository<PreprocessRawTask>
  ) {
    super(preprocessRawTaskRepository)
  }

  //TODO: Implement the startingBlockNumber correctly. Whether check the wallet or last transaction
  async getOrCreate(params: {
    address: string
    blockchainId: string
    syncType: TaskSyncType
    ingestionWorkflowId: string | null
  }) {
    const task = await this.findOne({
      where: {
        address: params.address,
        blockchainId: params.blockchainId,
        status: In([TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED])
      }
    })

    if (task) {
      return task
    }

    let lastCompletedRawTransactionId: string | null = null
    let lastCompletedBlockNumber: number | null = null
    let lastCompletedValidatedBlockNumber: number | null = null

    if (params.syncType === TaskSyncType.INCREMENTAL) {
      const lastCompletedtask = await this.findOne({
        where: {
          address: params.address,
          blockchainId: params.blockchainId,
          status: TaskStatusEnum.COMPLETED
        },
        order: { id: Direction.DESC }
      })
      lastCompletedRawTransactionId = lastCompletedtask?.metadata?.lastCompletedRawTransactionId
      lastCompletedBlockNumber = lastCompletedtask?.metadata?.lastCompletedBlockNumber
      lastCompletedValidatedBlockNumber = lastCompletedtask?.metadata?.lastCompletedValidatedBlockNumber
    }

    const preprocessRawTask = PreprocessRawTask.create({
      address: params.address,
      blockchainId: params.blockchainId,
      syncType: params.syncType,
      ingestionWorkflowId: params.ingestionWorkflowId,
      lastCompletedRawTransactionId,
      lastCompletedBlockNumber,
      lastCompletedValidatedBlockNumber
    })

    return this.create(preprocessRawTask)
  }

  async updateMetadata(id: string, metadata: PreprocessRawTaskMetadata) {
    return this.preprocessRawTaskRepository.update(id, { metadata })
  }

  updateFirstExecutedAt(task: PreprocessRawTask) {
    if (!task.firstExecutedAt) {
      return this.preprocessRawTaskRepository.update(task.id, { firstExecutedAt: dateHelper.getUTCTimestamp() })
    }
  }

  updateLastExecutedAt(id: string) {
    return this.preprocessRawTaskRepository.update(id, { lastExecutedAt: dateHelper.getUTCTimestamp() })
  }

  async changeStatus(id: string, status: TaskStatusEnum, error?: any) {
    const tempDate = dateHelper.getUTCTimestamp()
    const updateData: Partial<PreprocessRawTask> = {
      status,
      error: error ?? null,
      lastExecutedAt: status === TaskStatusEnum.RUNNING ? tempDate : undefined,
      completedAt: status === TaskStatusEnum.COMPLETED ? tempDate : undefined
    }
    return this.preprocessRawTaskRepository.update(id, updateData)
  }

  async updateError(taskId: string, e: any) {
    return this.preprocessRawTaskRepository.update(taskId, { error: e })
  }

  getRetryableTasks() {
    return this.preprocessRawTaskRepository.find({
      where: [
        {
          status: TaskStatusEnum.FAILED
        },
        {
          status: TaskStatusEnum.RUNNING,
          lastExecutedAt: LessThanOrEqual(dateHelper.getUTCTimestampMinutesAgo(2))
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
    return this.preprocessRawTaskRepository.find({
      where: [
        {
          status: TaskStatusEnum.CREATED,
          createdAt: LessThanOrEqual(queryTimestamp)
        },
        {
          status: TaskStatusEnum.RUNNING,
          lastExecutedAt: LessThanOrEqual(queryTimestamp)
        }
      ]
    })
  }

  async getAllRunningTasksForAddresses(addresses: string[]) {
    return this.preprocessRawTaskRepository.find({
      where: {
        status: TaskStatusEnum.RUNNING,
        address: In(addresses)
      }
    })
  }
}
