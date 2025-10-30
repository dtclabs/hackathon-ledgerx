import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { setTimeout } from 'timers/promises'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { CoreTransformationTasksEntityService } from '../../../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity-service'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import { CoreTransformationsDomainService } from '../core-transformations.domain.service'
import { FinancialTransformationsEventType } from '../events/events'
import { FinancialTransformationsDomainService } from '../financial-transformations.domain.service'

@Injectable()
export class CoreTransformationTasksListener {
  constructor(
    private eventEmitter: EventEmitter2,
    private coreTransformationTasksService: CoreTransformationTasksEntityService,
    private coreTransformationsDomainService: CoreTransformationsDomainService,
    private financialTransformationsDomainService: FinancialTransformationsDomainService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService
  ) {}

  @OnEvent(FinancialTransformationsEventType.CORE_TRANSFORMATION_SYNC_ADDRESS, { async: true, promisify: true })
  async handleCoreTransformationSyncAddressEvent(taskId: string) {
    let task = await this.coreTransformationTasksService.get(taskId)

    try {
      if (task.status !== TaskStatusEnum.COMPLETED) {
        await this.coreTransformationTasksService.changeStatus(task.id, TaskStatusEnum.RUNNING)

        await this.coreTransformationsDomainService.executeWorkflow(task)

        task = await this.coreTransformationTasksService.get(taskId)
        if (task.status !== TaskStatusEnum.COMPLETED) {
          if (task.syncType === TaskSyncType.INCREMENTAL) {
            await setTimeout(1000)
          } else {
            //Ingestion will take >10 seconds. So delay by 5 seconds.
            await setTimeout(5000)
          }
          this.eventEmitter.emit(FinancialTransformationsEventType.CORE_TRANSFORMATION_SYNC_ADDRESS, task.id)
        } else {
          const { minutes, seconds } = dateHelper.getMinutesAndSecondsDifferenceFromTime(task.createdAt)
          this.logger.info(
            `coreTransformationTask ${taskId} is COMPLETED for ${minutes} minutes and ${seconds} seconds`
          )

          await this.financialTransformationsDomainService.additionalSync({
            address: task.address,
            organizationId: task.organizationId,
            syncType: task.syncType,
            blockchainId: task.blockchainId
          })
        }
      }
    } catch (e) {
      await this.coreTransformationTasksService.updateError(taskId, e)
      this.logger.error(`coreTransformationTask ${taskId} has errors`, e)
    }
  }
}
