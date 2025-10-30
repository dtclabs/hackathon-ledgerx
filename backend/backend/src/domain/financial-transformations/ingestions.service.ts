import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { setTimeout } from 'timers/promises'
import { In } from 'typeorm'
import { TaskStatusEnum } from '../../core/events/event-types'
import { IngestionProcessEntityService } from '../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { IngestionWorkflow } from '../../shared/entity-services/ingestion-workflows/ingestion-workflow.entity'
import { IngestionWorkflowsEntityService } from '../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { dateHelper } from '../../shared/helpers/date.helper'
import { LoggerService } from '../../shared/logger/logger.service'
import { IngestionEventType, IngestionExecuteProcessEvent, IngestionSyncEvent } from './events/events'
import { IngestionProcessWrapper } from './ingestion/commands/ingestion-process.wrapper'
import { IngestionProcessFactory } from './ingestion/ingestion-process.factory'

@Injectable()
export class IngestionsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly ingestionWorkflowsEntityService: IngestionWorkflowsEntityService,
    private readonly configService: ConfigService,
    private readonly ingestionProcessEntityService: IngestionProcessEntityService,
    private readonly logger: LoggerService,
    private readonly ingestionWrapper: IngestionProcessWrapper,
    private readonly ingestionProcessFactory: IngestionProcessFactory
  ) {}

  async sync(address: string, blockchainId: string): Promise<string> {
    try {
      const ingestionWorkflow = await this.createIngestionWorkflow(blockchainId, address)

      const createdWorkflow = await this.ingestionWorkflowsEntityService.getOrCreate(ingestionWorkflow)
      this.logger.info(`Create or Get sync task for address ${address}`, { createdTask: createdWorkflow })

      if (createdWorkflow.status === TaskStatusEnum.RUNNING) {
        // Skip if task is already in progress
        return
      }

      if (
        createdWorkflow.status === TaskStatusEnum.FAILED &&
        createdWorkflow.error?.retryAt > dateHelper.getUTCTimestamp()
      ) {
        // backoff timeout haven't passed yet
        return
      }

      this.eventEmitter.emit(IngestionEventType.INGESTION_SYNC_ADDRESS, new IngestionSyncEvent(createdWorkflow.id))

      return createdWorkflow.id
    } catch (e) {
      this.logger.error(`Can not create IngestionTask for address ${address}`, e, {
        address
      })
    }
  }

  private async createIngestionWorkflow(blockchainId: string, address: string) {
    return IngestionWorkflow.create({
      blockchainId,
      address,
      fromBlock: null
    })
  }

  async createIngestionProcessesForWorkflow(ingestionWorkflowId: string) {
    const ingestionWorkflow = await this.ingestionWorkflowsEntityService.get(ingestionWorkflowId)
    const ingestionProcesses = await this.ingestionProcessEntityService.getByWorkflowId(ingestionWorkflowId)

    if (ingestionProcesses.length) {
      this.logger.info(`Ingestion processes already exist for workflow ${ingestionWorkflowId}`, {
        ingestionWorkflowId
      })
      return
    }

    const processes = await this.ingestionProcessFactory.createByWorkflow(ingestionWorkflow)

    for (const process of processes) {
      this.eventEmitter.emit(
        IngestionEventType.INGESTION_EXECUTE_SYNC_PROCESS,
        new IngestionExecuteProcessEvent(process.id)
      )
      // reduce amount of simultaneous API calls.
      await setTimeout(2000)
    }
  }

  async executeSyncProcess(ingestionSyncProcessId: string) {
    await this.ingestionWrapper.execute(ingestionSyncProcessId)
  }

  async updateWorkflowStatusFromProcesses(ingestionWorkflowId: string) {
    const ingestionWorkflow = await this.ingestionWorkflowsEntityService.get(ingestionWorkflowId, {
      relations: {
        ingestionProcesses: true
      }
    })

    const allSyncing = ingestionWorkflow.ingestionProcesses.filter((ingestionProcess) =>
      [TaskStatusEnum.RUNNING, TaskStatusEnum.FAILED].includes(ingestionProcess.status)
    )

    if (allSyncing.length) {
      return await this.ingestionWorkflowsEntityService.changeStatus(ingestionWorkflow.id, TaskStatusEnum.RUNNING)
    }

    const isAnyTerminated = ingestionWorkflow.ingestionProcesses.find(
      (ingestionProcess) => ingestionProcess.status === TaskStatusEnum.TERMINATED
    )

    if (isAnyTerminated) {
      return await this.ingestionWorkflowsEntityService.changeStatus(ingestionWorkflow.id, TaskStatusEnum.TERMINATED)
    }

    const isAllCompleted = !ingestionWorkflow.ingestionProcesses.find(
      (ingestionProcess) => ingestionProcess.status !== TaskStatusEnum.COMPLETED
    )

    if (isAllCompleted) {
      return await this.ingestionWorkflowsEntityService.changeStatus(ingestionWorkflow.id, TaskStatusEnum.COMPLETED)
    }

    return ingestionWorkflow.status
  }

  async getWorkflowsReadyForRetry() {
    return this.ingestionWorkflowsEntityService.getFailedIngestionTasks()
  }

  async getFailedIngestionProcesses() {
    return this.ingestionProcessEntityService.getFailed()
  }

  async getAllRunningTasks() {
    return this.ingestionWorkflowsEntityService.find({
      where: { status: TaskStatusEnum.RUNNING }
    })
  }

  async getAllRunningTasksForAddresses(addresses: string[]) {
    return this.ingestionWorkflowsEntityService.find({
      where: {
        status: TaskStatusEnum.RUNNING,
        address: In(addresses)
      }
    })
  }
}
