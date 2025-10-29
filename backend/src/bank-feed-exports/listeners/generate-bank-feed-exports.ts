import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { BankFeedExportWorkflowEntityService } from '../../shared/entity-services/bank-feed-export-workflows/bank-feed-export-workflows.entity-service'
import { BankFeedExportStatus } from '../../shared/entity-services/bank-feed-export-workflows/interface'
import { dateHelper } from '../../shared/helpers/date.helper'
import { LoggerService } from '../../shared/logger/logger.service'
import { BankFeedGeneratorsDomainService } from '../bank-feed-export-generators.domain.service'
import { BankFeedExportEventType } from '../interface'

@Injectable()
export class GenerateBankFeedExportsListener {
  constructor(
    private bankFeedExportWorkflowEntityService: BankFeedExportWorkflowEntityService,
    private bankFeedGeneratorsDomainService: BankFeedGeneratorsDomainService,
    private logger: LoggerService
  ) {}

  @OnEvent(BankFeedExportEventType.GENERATE_FROM_FINANCIAL_TRANSACTION, { async: true, promisify: true })
  async generateBankFeedExports(workflowId: string) {
    let workflow = await this.bankFeedExportWorkflowEntityService.getById(workflowId)
    const { minutes, seconds } = dateHelper.getMinutesAndSecondsDifferenceFromTime(workflow.createdAt)
    this.logger.info(`Bank feed export workflow ${workflowId} is running for ${minutes} minutes and ${seconds} seconds`)
    try {
      if (workflow.status === BankFeedExportStatus.GENERATING) {
        await this.bankFeedExportWorkflowEntityService.updateLastExecutedAt(workflow.id)
        await this.bankFeedGeneratorsDomainService.executeWorkflow(workflow)
        workflow = await this.bankFeedExportWorkflowEntityService.getById(workflow.id)
        if (workflow.status === BankFeedExportStatus.GENERATING) {
          await this.bankFeedExportWorkflowEntityService.changeStatus(workflow.id, BankFeedExportStatus.COMPLETED, {
            completedAt: dateHelper.getUTCTimestamp()
          })
        }
      }
    } catch (e) {
      await this.bankFeedExportWorkflowEntityService.changeStatus(workflowId, BankFeedExportStatus.FAILED, {
        error: e
      })
      this.logger.error(`Bank feed export workflow ${workflowId} has errors`, e)
    }
  }
}
