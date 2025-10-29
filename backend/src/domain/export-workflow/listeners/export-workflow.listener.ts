import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import { ExportWorkflowEvent, ExportWorkflowEventType } from '../interface'
import { ExportWorkflowsEntityService } from '../../../shared/entity-services/export-workflows/export-workflows.entity.service'
import { ExportWorkflowsCommandFactory } from '../commands/export-workflows.command.factory'

@Injectable()
export class ExportWorkflowListener {
  constructor(
    private exportWorkflowsEntityService: ExportWorkflowsEntityService,
    private exportWorkflowsCommandFactory: ExportWorkflowsCommandFactory,
    private logger: LoggerService
  ) {}

  @OnEvent(ExportWorkflowEventType.EXPORT_WORKFLOW_GENERATE, { async: true, promisify: true })
  async generateExports(event: ExportWorkflowEvent) {
    try {
      let workflow = await this.exportWorkflowsEntityService.getById(event.workflowId)
      const { minutes, seconds } = dateHelper.getMinutesAndSecondsDifferenceFromTime(workflow.createdAt)
      this.logger.info(`Export workflow ${event.workflowId} is running for ${minutes} minutes and ${seconds} seconds`)
      await this.exportWorkflowsCommandFactory.getCommand(workflow.type).executeWorkflow(workflow)
    } catch (e) {
      this.logger.error(`Export workflow has errors`, e, {
        workflowId: event.workflowId,
        organizationId: event.organizationId
      })
    }
  }
}
