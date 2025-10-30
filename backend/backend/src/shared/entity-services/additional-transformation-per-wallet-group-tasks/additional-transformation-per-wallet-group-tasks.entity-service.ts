import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThanOrEqual, Repository } from 'typeorm'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { Direction } from '../../../core/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import {
  AdditionalTransformationPerWalletGroupTask,
  AdditionalTransformationPerWalletGroupTaskMetadata
} from './additional-transformation-per-wallet-group-task.entity'

@Injectable()
export class AdditionalTransformationPerWalletGroupTasksEntityService extends BaseEntityService<AdditionalTransformationPerWalletGroupTask> {
  constructor(
    @InjectRepository(AdditionalTransformationPerWalletGroupTask)
    private additionalTransformationPerWalletGroupTaskRepository: Repository<AdditionalTransformationPerWalletGroupTask>
  ) {
    super(additionalTransformationPerWalletGroupTaskRepository)
  }

  getTask(params: { walletGroupId: string; blockchainId: string; organizationId: string }) {
    return this.findOne({
      where: {
        walletGroupId: params.walletGroupId,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        status: In([TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED])
      }
    })
  }

  async createTaskIfNotExist(params: {
    walletGroupId: string
    blockchainId: string
    organizationId: string
    syncType: TaskSyncType
  }) {
    return this.additionalTransformationPerWalletGroupTaskRepository.manager.transaction(async (entityManager) => {
      const task = await entityManager.findOne(AdditionalTransformationPerWalletGroupTask, {
        where: {
          walletGroupId: params.walletGroupId,
          blockchainId: params.blockchainId,
          organizationId: params.organizationId,
          status: In([TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED])
        },
        transaction: true
      })

      if (!task) {
        let lastCompletedFinancialTransactionChildId = null

        if (params.syncType === TaskSyncType.INCREMENTAL) {
          const lastCompletedtask = await this.findOne({
            where: {
              walletGroupId: params.walletGroupId,
              blockchainId: params.blockchainId,
              organizationId: params.organizationId,
              status: TaskStatusEnum.COMPLETED
            },
            order: { id: Direction.DESC }
          })

          lastCompletedFinancialTransactionChildId =
            lastCompletedtask?.metadata?.lastCompletedFinancialTransactionChildId
        }

        const additionalTransformationPerWalletGroupTask = AdditionalTransformationPerWalletGroupTask.create({
          walletGroupId: params.walletGroupId,
          blockchainId: params.blockchainId,
          organizationId: params.organizationId,
          syncType: params.syncType,
          lastCompletedFinancialTransactionChildId
        })

        return entityManager.save(additionalTransformationPerWalletGroupTask)
      }

      return null
    })
  }

  async updateMetadata(id: string, metadata: AdditionalTransformationPerWalletGroupTaskMetadata) {
    return this.additionalTransformationPerWalletGroupTaskRepository.update(id, { metadata })
  }

  updateFirstExecutedAt(task: AdditionalTransformationPerWalletGroupTask) {
    if (!task.firstExecutedAt) {
      return this.additionalTransformationPerWalletGroupTaskRepository.update(task.id, {
        firstExecutedAt: dateHelper.getUTCTimestamp()
      })
    }
  }

  updateLastExecutedAt(id: string) {
    return this.additionalTransformationPerWalletGroupTaskRepository.update(id, {
      lastExecutedAt: dateHelper.getUTCTimestamp()
    })
  }

  async changeStatus(id: string, status: TaskStatusEnum, error?: any) {
    const tempDate = dateHelper.getUTCTimestamp()
    const updateData: Partial<AdditionalTransformationPerWalletGroupTask> = {
      status,
      error: error ?? null,
      lastExecutedAt: status === TaskStatusEnum.RUNNING ? tempDate : undefined,
      completedAt: status === TaskStatusEnum.COMPLETED ? tempDate : undefined
    }
    return this.additionalTransformationPerWalletGroupTaskRepository.update(id, updateData)
  }

  async updateError(taskId: string, e: any) {
    return this.additionalTransformationPerWalletGroupTaskRepository.update(taskId, { error: e })
  }

  getRetryableTasks() {
    return this.additionalTransformationPerWalletGroupTaskRepository.find({
      where: [
        {
          status: TaskStatusEnum.FAILED
        },
        {
          status: TaskStatusEnum.RUNNING,
          lastExecutedAt: LessThanOrEqual(dateHelper.getUTCTimestampMinutesAgo(20))
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
    return this.additionalTransformationPerWalletGroupTaskRepository.find({
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
    return this.additionalTransformationPerWalletGroupTaskRepository.find({
      where: {
        status: TaskStatusEnum.RUNNING,
        organizationId: organizationId
      }
    })
  }
}
