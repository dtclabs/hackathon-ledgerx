import { Injectable } from '@nestjs/common'
import { TaskStatusEnum } from '../../core/events/event-types'
import { SupportedBlockchains } from '../../shared/entity-services/blockchains/interfaces'
import { IngestionWorkflow } from '../../shared/entity-services/ingestion-workflows/ingestion-workflow.entity'
import { IngestionWorkflowsEntityService } from '../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { PreprocessRawTask } from '../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-task.entity'
import { LoggerService } from '../../shared/logger/logger.service'
import { PreprocessStrategyFactory } from './preprocess/preprocess-strategy.factory'

@Injectable()
export class PreprocessRawsDomainService {
  constructor(
    private ingestionTaskService: IngestionWorkflowsEntityService,
    private logger: LoggerService,
    private readonly preprocessStrategyFactory: PreprocessStrategyFactory
  ) {}

  async executeWorkflow(task: PreprocessRawTask) {
    let ingestionTask: IngestionWorkflow = null
    if (task.metadata.ingestionWorkflowId) {
      ingestionTask = await this.ingestionTaskService.get(task.metadata.ingestionWorkflowId)
    }

    if (
      !ingestionTask ||
      ingestionTask.status === TaskStatusEnum.COMPLETED ||
      (ingestionTask.status === TaskStatusEnum.FAILED && ingestionTask.blockchainId === SupportedBlockchains.GOERLI)
    ) {
      await this.preprocessStrategyFactory.getStrategy(task.blockchainId).execute(task)
    }
  }
}
