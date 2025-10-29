import { EventEmitter2 } from '@nestjs/event-emitter'
import { TaskStatusEnum } from '../../../../core/events/event-types'
import { IngestionProcess } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import {
  EtherscanIngestionTaskMetadata,
  EvmBlockRewardMetadata,
  IngestionProcessMetadata
} from '../../../../shared/entity-services/ingestion-process/interfaces'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionEventType, IngestionExecuteProcessEvent, IngestionSyncEvent } from '../../events/events'

export const MAX_RETRIES = 20

export abstract class IngestionProcessCommand<Metadata extends IngestionProcessMetadata> {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly ingestionProcessEntityService: IngestionProcessEntityService,
    protected readonly logger: LoggerService
  ) {}

  private async changeStatus(params: { ingestionProcess: IngestionProcess; status: TaskStatusEnum }): Promise<void> {
    await this.ingestionProcessEntityService.changeStatus(params.ingestionProcess.id, params.status)
    this.eventEmitter.emit(
      IngestionEventType.INGESTION_SYNC_PROCESS_STATUS_UPDATED,
      new IngestionSyncEvent(params.ingestionProcess.ingestionWorkflow.id)
    )
  }

  protected abstract pullAndSaveData(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: Metadata
  }): Promise<void>

  //TODO: Why is this generic when its only for etherscan?
  protected abstract getNewMetadataForNewProcess(terminatedProcess: IngestionProcess): Metadata

  protected complete(ingestionProcess: IngestionProcess) {
    return this.changeStatus({ ingestionProcess: ingestionProcess, status: TaskStatusEnum.COMPLETED })
  }

  async executeProcess(ingestionProcess: IngestionProcess) {
    const ingestionWorkflow = ingestionProcess.ingestionWorkflow
    if (!ingestionWorkflow) {
      this.logger.error(`Can't find ingestion task with id ${ingestionProcess.id}`)
      return
    }

    const address = ingestionProcess.ingestionWorkflow.address
    const blockchainId = ingestionProcess.ingestionWorkflow.blockchainId

    const metadata = ingestionProcess.metadata
    try {
      this.logger.info(`Start sync address ${address}`, {
        ingestionProcessId: ingestionProcess.id,
        meta: metadata
      })

      await this.changeStatus({
        ingestionProcess: ingestionProcess,
        status: TaskStatusEnum.RUNNING
      })

      await this.pullAndSaveData({
        address: address,
        blockchainId: blockchainId,
        metadata: metadata as Metadata,
        ingestionProcess: ingestionProcess
      })
    } catch (e) {
      this.logger.warning(`Can not sync address ${address}`, e, { ingestionProcess: ingestionProcess })
      await this.handleError(ingestionProcess, e)
      this.eventEmitter.emit(
        IngestionEventType.INGESTION_SYNC_PROCESS_STATUS_UPDATED,
        new IngestionSyncEvent(ingestionWorkflow.id)
      )
    }
  }

  async next(ingestionProcess: IngestionProcess, metadata: Metadata) {
    await this.ingestionProcessEntityService.updateMetadata(ingestionProcess.id, metadata)
    this.logger.info(`Emitted sync event for address ${ingestionProcess.ingestionWorkflow.address}`, {
      ingestionProcessId: ingestionProcess.id,
      metadata
    })
    this.eventEmitter.emit(
      IngestionEventType.INGESTION_EXECUTE_SYNC_PROCESS,
      new IngestionExecuteProcessEvent(ingestionProcess.id)
    )
  }

  async handleError(ingestionProcess: IngestionProcess, error: Error | any) {
    const errorMessage = error.stack ?? error.toString() ?? error
    const messages = ingestionProcess.error?.messages?.length
      ? [...ingestionProcess.error.messages, errorMessage]
      : [errorMessage]

    if (ingestionProcess.error?.retryCount >= MAX_RETRIES) {
      const status = await this.ingestionProcessEntityService.changeStatus(
        ingestionProcess.id,
        TaskStatusEnum.TERMINATED,
        {
          messages: messages,
          retryAt: null,
          retryCount: (ingestionProcess.error?.retryCount ?? 0) + 1
        }
      )
      this.logger.error(`Sync process ${ingestionProcess.id} has been terminated`, {
        ingestionProcessId: ingestionProcess.id,
        lastError: error
      })
      // await this.handleTerminated(ingestionTask)
    } else {
      const backOffSeconds = 2 ** (ingestionProcess.error?.retryCount ?? 0) * 10
      const retryAt = dateHelper.getUTCTimestampSecondsForward(backOffSeconds)
      this.logger.debug(`Backoff for ${ingestionProcess.id} is ${backOffSeconds}s`, {
        now: dateHelper.getUTCTimestamp(),
        retryAt
      })

      return this.ingestionProcessEntityService.changeStatus(ingestionProcess.id, TaskStatusEnum.FAILED, {
        messages: messages,
        retryAt,
        retryCount: (ingestionProcess.error?.retryCount ?? 0) + 1
      })
    }
  }

  private async handleTerminated(originalProcess: IngestionProcess) {
    const blockNumber: number | null =
      (originalProcess.metadata as EtherscanIngestionTaskMetadata).fromBlock ??
      (originalProcess.metadata as EvmBlockRewardMetadata).lastBlock ??
      null

    const newIngestionProcess = IngestionProcess.create({
      ingestionWorkflow: originalProcess.ingestionWorkflow,
      contractConfiguration: originalProcess.contractConfiguration,
      fromBlock: blockNumber,
      type: originalProcess.type,
      syncType: originalProcess.syncType
    })

    newIngestionProcess.metadata = this.getNewMetadataForNewProcess(originalProcess)
    await this.ingestionProcessEntityService.create(newIngestionProcess)
    await this.ingestionProcessEntityService.softDelete(originalProcess.id)
  }
}
