import { Injectable } from '@nestjs/common'
import { SpotBalanceExportWorkflowCommand } from './spot-balance/spot-balance-export-workflow.command'
import { ExportWorkflowType } from '../../../shared/entity-services/export-workflows/interface'
import { ExportWorkflowBaseCommand } from './export-workflow.base.command'

@Injectable()
export class ExportWorkflowsCommandFactory {
  constructor(private spotBalanceExportWorkflowCommand: SpotBalanceExportWorkflowCommand) {}

  getCommand(type: ExportWorkflowType): ExportWorkflowBaseCommand<unknown> {
    switch (type) {
      case ExportWorkflowType.SPOT_BALANCE:
        return this.spotBalanceExportWorkflowCommand
      default:
        throw new Error(`Unknown export workflow type ${type}`)
    }
  }
}
