import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Cron } from '@nestjs/schedule'
import { setTimeout } from 'timers/promises'
import { JournalEntryExportEventType } from '../domain/journal-entry-export-workflows/events/events'
import { JournalEntryExportWorkflowEntityService } from '../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'

@Injectable()
export class JournalEntryExportScheduler {
  constructor(
    private logger: LoggerService,
    private eventEmitter: EventEmitter2,
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService
  ) {}

    // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('*/5 * * * *', { utcOffset: 0 })
  async processJobExportJournalEntry() {
    this.logger.info('Initiate job to retry generating journal entry export workflow', dateHelper.getUTCTimestamp())

    const exportWorkflows = await this.journalEntryExportWorkflowEntityService.getExportingWorkflows(4)
    this.logger.info('Amounts of failed to generate journal entry export workflows: ', exportWorkflows.length)

    for (const exportWorkflow of exportWorkflows) {
      this.eventEmitter.emit(JournalEntryExportEventType.EXPORT_TO_THIRD_PARTY, exportWorkflow.id)

      await setTimeout(10000)
    }
  }
}
