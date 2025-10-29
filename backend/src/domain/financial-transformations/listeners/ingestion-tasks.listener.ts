import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { LoggerService } from '../../../shared/logger/logger.service'
import { IngestionEventType, IngestionExecuteProcessEvent, IngestionSyncEvent } from '../events/events'
import { IngestionsService } from '../ingestions.service'

@Injectable()
export class IngestionTasksListener {
  constructor(
    private readonly ingestionsService: IngestionsService,
    private logger: LoggerService,
    private featureFlagsService: FeatureFlagsEntityService
  ) {}

  @OnEvent(IngestionEventType.INGESTION_SYNC_ADDRESS, { async: true, promisify: true })
  async handleIngestionSyncAddressEvent(event: IngestionSyncEvent) {
    try {
      this.logger.info(`Sync wallet transactions for ingestionTask ${event.ingestionWorkflowId}`, { event })
      await this.ingestionsService.createIngestionProcessesForWorkflow(event.ingestionWorkflowId)
    } catch (e) {
      this.logger.error(`Can't sync source of fund for ingestionTask ${event?.ingestionWorkflowId}: ${e.message}`, e, {
        event
      })
    }
  }

  @OnEvent(IngestionEventType.INGESTION_EXECUTE_SYNC_PROCESS, { async: true, promisify: true })
  async handleIngestionExecuteSyncProcessEvent(event: IngestionExecuteProcessEvent) {
    try {
      this.logger.info(`Start execute ingestion sync process ${event?.ingestionProcessId}`, { event })
      await this.ingestionsService.executeSyncProcess(event.ingestionProcessId)
    } catch (e) {
      this.logger.error(`Can't execute ingestion sync process ${event?.ingestionProcessId}: ${e.message}`, e, {
        event
      })
    }
  }

  @OnEvent(IngestionEventType.INGESTION_SYNC_PROCESS_STATUS_UPDATED, { async: true, promisify: true })
  async handleIngestionSyncProcessStatusUpdatedEvent(event: IngestionSyncEvent) {
    try {
      this.logger.info(`Start updating ingestion workflow status ${event?.ingestionWorkflowId}`, { event })
      await this.ingestionsService.updateWorkflowStatusFromProcesses(event.ingestionWorkflowId)
    } catch (e) {
      this.logger.error(`Can't update ingestion workflow status ${event?.ingestionWorkflowId}: ${e.message}`, e, {
        event
      })
    }
  }
}
