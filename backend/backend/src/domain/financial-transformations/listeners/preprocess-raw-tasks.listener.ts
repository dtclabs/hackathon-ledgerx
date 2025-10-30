import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { setTimeout } from 'timers/promises'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { PreprocessRawTasksEntityService } from '../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import { FinancialTransformationsEventType } from '../events/events'
import { PreprocessRawsDomainService } from '../preprocess-raws.domain.service'

@Injectable()
export class PreprocessRawTasksListener {
  constructor(
    private eventEmitter: EventEmitter2,
    private preprocessRawTasksService: PreprocessRawTasksEntityService,
    private preprocessRawsDomainService: PreprocessRawsDomainService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService
  ) {}

  @OnEvent(FinancialTransformationsEventType.PREPROCESS_RAW_SYNC_ADDRESS, { async: true, promisify: true })
  async handlePreprocessRawSyncAddressEvent(taskId: string) {
    let task = await this.preprocessRawTasksService.get(taskId)

    try {
      if (task.status !== TaskStatusEnum.COMPLETED) {
        await this.preprocessRawTasksService.changeStatus(task.id, TaskStatusEnum.RUNNING)

        await this.preprocessRawsDomainService.executeWorkflow(task)

        task = await this.preprocessRawTasksService.get(taskId)
        if (task.status !== TaskStatusEnum.COMPLETED) {
          if (task.syncType === TaskSyncType.INCREMENTAL) {
            await setTimeout(1000)
          } else {
            //Retry here. Ingestion will take >10 seconds. So delay by 4 seconds.
            await setTimeout(4000)
          }
          this.eventEmitter.emit(FinancialTransformationsEventType.PREPROCESS_RAW_SYNC_ADDRESS, task.id)
        } else {
          const { minutes, seconds } = dateHelper.getMinutesAndSecondsDifferenceFromTime(task.createdAt)
          this.logger.info(`preprocessRawTask ${taskId} is COMPLETED after ${minutes} minutes and ${seconds} seconds`)
        }
      }
    } catch (e) {
      await this.preprocessRawTasksService.updateError(taskId, e)
      this.logger.error(`preprocessRawTask ${taskId} has errors`, e)
    }
  }
}
