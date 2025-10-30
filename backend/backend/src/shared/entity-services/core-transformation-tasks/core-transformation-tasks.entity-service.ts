import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThanOrEqual, Repository } from 'typeorm'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { Direction } from '../../../core/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { CoreTransformationTask, CoreTransformationTaskMetadata } from './core-transformation-tasks.entity'

@Injectable()
export class CoreTransformationTasksEntityService extends BaseEntityService<CoreTransformationTask> {
  constructor(
    @InjectRepository(CoreTransformationTask)
    private coreTransformationTaskRepository: Repository<CoreTransformationTask>
  ) {
    super(coreTransformationTaskRepository)
  }

  async getOrCreate(params: {
    address: string
    blockchainId: string
    organizationId: string
    syncType: TaskSyncType
    preprocessRawTaskId?: string | null
  }) {
    const task = await this.findOne({
      where: {
        address: params.address,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        status: In([TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED])
      }
    })

    if (task) {
      return task
    }

    let lastCompletedFinancialTransactionPreprocessId = null

    if (params.syncType === TaskSyncType.INCREMENTAL) {
      const lastCompletedtask = await this.findOne({
        where: {
          address: params.address,
          blockchainId: params.blockchainId,
          organizationId: params.organizationId,
          status: TaskStatusEnum.COMPLETED
        },
        order: { id: Direction.DESC }
      })
      lastCompletedFinancialTransactionPreprocessId =
        lastCompletedtask?.metadata?.lastCompletedFinancialTransactionPreprocessId
    }

    const coreTransformationTask = CoreTransformationTask.create({
      address: params.address,
      blockchainId: params.blockchainId,
      organizationId: params.organizationId,
      syncType: params.syncType,
      preprocessRawTaskId: params.preprocessRawTaskId,
      lastCompletedFinancialTransactionPreprocessId
    })

    return this.create(coreTransformationTask)
  }

  getCurrentTaskByAddressAndBlockchainAndOrganization(params: {
    address: string
    blockchainId: string
    organizationId: string
  }) {
    return this.findOne({
      where: {
        address: params.address,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        status: In([TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED])
      }
    })
  }

  async updateMetadata(id: string, metadata: CoreTransformationTaskMetadata) {
    return this.coreTransformationTaskRepository.update(id, { metadata })
  }

  updateFirstExecutedAt(task: CoreTransformationTask) {
    if (!task.firstExecutedAt) {
      return this.coreTransformationTaskRepository.update(task.id, { firstExecutedAt: dateHelper.getUTCTimestamp() })
    }
  }

  updateLastExecutedAt(id: string) {
    return this.coreTransformationTaskRepository.update(id, { lastExecutedAt: dateHelper.getUTCTimestamp() })
  }

  async changeStatus(id: string, status: TaskStatusEnum, error?: any) {
    const tempDate = dateHelper.getUTCTimestamp()
    const updateData: Partial<CoreTransformationTask> = {
      status,
      error: error ?? null,
      lastExecutedAt: status === TaskStatusEnum.RUNNING ? tempDate : undefined,
      completedAt: status === TaskStatusEnum.COMPLETED ? tempDate : undefined
    }
    return this.coreTransformationTaskRepository.update(id, updateData)
  }

  async updateError(taskId: string, e: any) {
    return this.coreTransformationTaskRepository.update(taskId, { error: e.stack })
  }

  getRetryableTasks() {
    return this.coreTransformationTaskRepository.find({
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
    return this.coreTransformationTaskRepository.find({
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

  async getAllRunningTasksForOrganization(organizationId: string) {
    return this.coreTransformationTaskRepository.find({
      where: {
        status: TaskStatusEnum.RUNNING,
        organizationId: organizationId
      }
    })
  }
}
