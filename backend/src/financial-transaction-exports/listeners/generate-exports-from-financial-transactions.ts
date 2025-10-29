import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { FinancialTransactionExportWorkflowEntityService } from '../../shared/entity-services/financial-transaction-export-workflows/financial-transaction-export-workflows.entity-service'
import { FinancialTransactionExportStatus } from '../../shared/entity-services/financial-transaction-export-workflows/interface'
import { dateHelper } from '../../shared/helpers/date.helper'
import { LoggerService } from '../../shared/logger/logger.service'
import { FinancialTransactionGeneratorsDomainService } from '../financial-transaction-export-generators.domain.service'
import { FinancialTransactionExportEventType } from '../interface'

@Injectable()
export class GenerateExportFromFinancialTransactionsListener {
  constructor(
    private financialTransactionExportWorkflowEntityService: FinancialTransactionExportWorkflowEntityService,
    private financialTransactionGeneratorsDomainService: FinancialTransactionGeneratorsDomainService,
    private logger: LoggerService
  ) {}

  @OnEvent(FinancialTransactionExportEventType.GENERATE_FROM_FINANCIAL_TRANSACTION, { async: true, promisify: true })
  async generateExportFromFinancialTransactions(workflowId: string) {
    let workflow = await this.financialTransactionExportWorkflowEntityService.getById(workflowId)

    try {
      if (workflow.status === FinancialTransactionExportStatus.GENERATING) {
        await this.financialTransactionExportWorkflowEntityService.updateLastExecutedAt(workflow.id)
        await this.financialTransactionGeneratorsDomainService.executeWorkflow(workflow)
        workflow = await this.financialTransactionExportWorkflowEntityService.getById(workflow.id)
        if (workflow.status === FinancialTransactionExportStatus.GENERATING) {
          await this.financialTransactionExportWorkflowEntityService.changeStatus(
            workflow.id,
            FinancialTransactionExportStatus.COMPLETED,
            {
              completedAt: dateHelper.getUTCTimestamp()
            }
          )
        }
      }
    } catch (e) {
      await this.financialTransactionExportWorkflowEntityService.changeStatus(
        workflowId,
        FinancialTransactionExportStatus.FAILED,
        {
          error: e
        }
      )
      this.logger.error(
        `Financial Transaction Export generateFromFinancialTransaction workflow ${workflowId} has errors`,
        e
      )
    }
  }
}
