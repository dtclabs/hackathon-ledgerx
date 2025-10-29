import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThanOrEqual, Repository } from 'typeorm'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import {
  AdditionalTransformationPerWalletTask,
  AdditionalTransformationPerWalletTaskMetadata
} from './additional-transformation-per-wallet-task.entity'

@Injectable()
export class AdditionalTransformationPerWalletTasksEntityService extends BaseEntityService<AdditionalTransformationPerWalletTask> {
  constructor(
    @InjectRepository(AdditionalTransformationPerWalletTask)
    private additionalTransformationPerWalletTaskRepository: Repository<AdditionalTransformationPerWalletTask>
  ) {
    super(additionalTransformationPerWalletTaskRepository)
  }

  getCurrentTaskByWalletAndBlockchainAndOrganization(params: {
    walletId: string
    blockchainId: string
    organizationId: string
  }) {
    return this.findOne({
      where: {
        walletId: params.walletId,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        status: In([TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED])
      }
    })
  }

  async getOrCreate(params: {
    walletId: string
    address: string
    blockchainId: string
    organizationId: string
    syncType: TaskSyncType
  }) {
    return this.additionalTransformationPerWalletTaskRepository.manager.transaction(async (entityManager) => {
      const task = await entityManager.findOne(AdditionalTransformationPerWalletTask, {
        where: {
          walletId: params.walletId,
          blockchainId: params.blockchainId,
          organizationId: params.organizationId,
          status: In([TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED])
        },
        transaction: true
      })

      if (task) {
        return task
      }

      const additionalTransformationPerWalletTask = AdditionalTransformationPerWalletTask.create({
        walletId: params.walletId,
        address: params.address,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        syncType: params.syncType
      })

      return await entityManager.save(additionalTransformationPerWalletTask)
    })
  }

  async updateMetadata(id: string, metadata: AdditionalTransformationPerWalletTaskMetadata) {
    return this.additionalTransformationPerWalletTaskRepository.update(id, { metadata })
  }

  updateFirstExecutedAt(task: AdditionalTransformationPerWalletTask) {
    if (!task.firstExecutedAt) {
      return this.additionalTransformationPerWalletTaskRepository.update(task.id, {
        firstExecutedAt: dateHelper.getUTCTimestamp()
      })
    }
  }

  updateLastExecutedAt(id: string) {
    return this.additionalTransformationPerWalletTaskRepository.update(id, {
      lastExecutedAt: dateHelper.getUTCTimestamp()
    })
  }

  async changeStatus(id: string, status: TaskStatusEnum, error?: any) {
    const tempDate = dateHelper.getUTCTimestamp()
    const updateData: Partial<AdditionalTransformationPerWalletTask> = {
      status,
      error: error ?? null,
      lastExecutedAt: status === TaskStatusEnum.RUNNING ? tempDate : undefined,
      completedAt: status === TaskStatusEnum.COMPLETED ? tempDate : undefined
    }
    return this.additionalTransformationPerWalletTaskRepository.update(id, updateData)
  }

  async updateError(taskId: string, e: any) {
    return this.additionalTransformationPerWalletTaskRepository.update(taskId, { error: e })
  }

  getRetryableTasks() {
    return this.additionalTransformationPerWalletTaskRepository.find({
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
    return this.additionalTransformationPerWalletTaskRepository.find({
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
    return this.additionalTransformationPerWalletTaskRepository.find({
      where: {
        status: TaskStatusEnum.RUNNING,
        organizationId: organizationId
      }
    })
  }
}
