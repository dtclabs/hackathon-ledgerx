import { BadRequestException, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FinancialTransactionQueryParams } from '../../financial-transactions/interfaces'
import { BlockchainsEntityService } from '../../shared/entity-services/blockchains/blockchains.entity-service'
import { ChartOfAccountMappingsEntityService } from '../../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { IntegrationName } from '../../shared/entity-services/integration/integration.entity'
import { JournalEntryStatus } from '../../shared/entity-services/journal-entries/interfaces'
import { JournalEntriesEntityService } from '../../shared/entity-services/journal-entries/journal-entries.entity-service'
import {
  JournalEntryExportStatus,
  JournalEntryExportType
} from '../../shared/entity-services/journal-entry-export-workflows/interfaces'
import { JournalEntryExportWorkflowEntityService } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { dateHelper } from '../../shared/helpers/date.helper'
import { LoggerService } from '../../shared/logger/logger.service'
import { ChartOfAccountRulesDomainService } from '../chart-of-account-rules/chart-of-account-rules.domain.service'
import { JournalEntryExportEventType } from './events/events'

@Injectable()
export class JournalEntryExportWorkflowsDomainService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private logger: LoggerService,
    private journalEntriesEntityService: JournalEntriesEntityService,
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private chartOfAccountRulesDomainService: ChartOfAccountRulesDomainService,
    private blockchainsEntityService: BlockchainsEntityService
  ) {}

  async initiateNewWorkflow(params: {
    organizationId: string
    requestedBy: string
    integrationName: IntegrationName
    type: JournalEntryExportType
    financialTransactionParentPublicIds?: string[]
    queryParams: FinancialTransactionQueryParams
  }) {
    const isDefaultMappingSet =
      await this.chartOfAccountMappingsEntityService.isDefaultMappingFullySetupForOrganization(params.organizationId)

    if (!isDefaultMappingSet) {
      throw new BadRequestException(`Account Rules need to be fully set up first`)
    }

    // TODO: Yohanes to complete this after VIshwas'code
    // const isCOAFullySynced: boolean = await this.chartOfAccountMappingsEntityService.isCoaFullySynced(organizatiodId)

    // if (!isCOAFullySynced) {
    //   throw new BadRequestException('There is a difference between coa in hq and xero. You will need to sync it first.')
    // }

    if (params.type !== JournalEntryExportType.MANUAL && params.financialTransactionParentPublicIds?.length) {
      throw new BadRequestException('Transaction id(s) are not required for these transaction types')
    }

    const filteredTransactionParentIds: Set<string> = new Set<string>()
    if (params.type === JournalEntryExportType.ALL) {
      const hasNullAccountChildren = await this.hasNullAccountChildren(params.organizationId)

      if (!hasNullAccountChildren) {
        throw new BadRequestException('Transaction(s) need to be set with chart of account first')
      }
    }

    if (params.type === JournalEntryExportType.FILTERED) {
      if (!params.queryParams || !Object.keys(params.queryParams).length) {
        throw new BadRequestException('Filtered export needs query params')
      }

      let skip = 0
      const batchSize = 500
      let financialTransactionChildren: FinancialTransactionChild[] = []

      // get default blockchain
      const blockchains = await this.blockchainsEntityService.getEnabledFromOrDefaultIfEmpty(
        params.queryParams?.blockchainIds
      )

      do {
        financialTransactionChildren = await this.financialTransactionsEntityService.getAllChildren(
          { ...params.queryParams, blockchainIds: blockchains.map((b) => b.publicId) },
          params.organizationId,
          skip,
          batchSize
        )

        const hasNullAccountChildren = await this.hasNullAccountChildren(
          params.organizationId,
          financialTransactionChildren.map((transaction) => transaction.id)
        )
        if (!hasNullAccountChildren) {
          throw new BadRequestException('Transaction(s) need to be set with chart of account first')
        }

        for (const child of financialTransactionChildren) {
          filteredTransactionParentIds.add(child.financialTransactionParent.id)
        }

        skip++
      } while (financialTransactionChildren.length === batchSize)
    }
    if (
      params.type !== JournalEntryExportType.FILTERED &&
      params.queryParams &&
      Object.keys(params.queryParams).length
    ) {
      throw new BadRequestException('Query(s) are not required for filtered export type')
    }

    if (params.type === JournalEntryExportType.MANUAL && !params.financialTransactionParentPublicIds?.length) {
      throw new BadRequestException('Manual export needs transaction ids')
    }

    const runningWorkflows = await this.journalEntryExportWorkflowEntityService.getRunningWorkflowsByOrganization(
      params.organizationId
    )

    if (runningWorkflows?.length) {
      throw new BadRequestException('Unable to start a new export while another export workflow is running ')
    }

    let financialTransactionParentIds = []
    if (params.queryParams && Object.keys(params.queryParams).length) {
      financialTransactionParentIds = [...filteredTransactionParentIds]
    } else if (params.financialTransactionParentPublicIds?.length) {
      const financialTransactionParents =
        await this.financialTransactionsEntityService.getParentsByOrganizationIdAndPublicIds(
          params.organizationId,
          params.financialTransactionParentPublicIds,
          { id: true, financialTransactionChild: true, activity: true },
          { financialTransactionChild: { financialTransactionChildMetadata: { correspondingChartOfAccount: true } } }
        )

      if (params.financialTransactionParentPublicIds?.length !== financialTransactionParents?.length) {
        throw new BadRequestException('Invalid transactions id(s) for journal entry export')
      }

      for (const parent of financialTransactionParents) {
        for (const child of parent.financialTransactionChild) {
          if (child.financialTransactionChildMetadata.correspondingChartOfAccount === null) {
            const needCorrespondingCOA =
              await this.chartOfAccountRulesDomainService.doesFinancialTransactionChildNeedCorrespondingCOA({
                activity: parent.activity,
                type: child.financialTransactionChildMetadata.type,
                gainLossInclusionStatus: child.financialTransactionChildMetadata.gainLossInclusionStatus
              })

            if (needCorrespondingCOA) {
              throw new BadRequestException('Transaction(s) need to be set with chart of account first')
            }
          }
        }
      }

      financialTransactionParentIds = financialTransactionParents.map((parent) => parent.id)
    }

    const workflow = await this.journalEntryExportWorkflowEntityService.createWorkflow({
      organizationId: params.organizationId,
      requestedBy: params.requestedBy,
      integrationName: params.integrationName,
      type: params.type,
      financialTransactionParentIds: financialTransactionParentIds
    })

    this.eventEmitter.emit(JournalEntryExportEventType.GENERATE_FROM_FINANCIAL_TRANSACTION, workflow.id)

    return workflow
  }

  async abortGeneratedWorkflow(params: { journalEntryExportWorkflowPublicId: string; organizationId: string }) {
    const journalEntryExportWorkflow =
      await this.journalEntryExportWorkflowEntityService.getJournalEntryExportWorkflowByOrganizationAndPublicIdAndStatus(
        params.organizationId,
        params.journalEntryExportWorkflowPublicId,
        JournalEntryExportStatus.GENERATED,
        { journalEntries: true }
      )

    if (!journalEntryExportWorkflow) {
      throw new BadRequestException('The given journalEntryExportWorkflow does not exist in the organization')
    }

    await this.journalEntriesEntityService.softDeleteByJournalEntryIds(
      journalEntryExportWorkflow.journalEntries?.map((entry) => entry.id)
    )

    await this.journalEntryExportWorkflowEntityService.updateStatusById(
      journalEntryExportWorkflow.id,
      JournalEntryExportStatus.ABORTED
    )

    journalEntryExportWorkflow.status = JournalEntryExportStatus.ABORTED

    return journalEntryExportWorkflow
  }

  async exportGeneratedWorkflow(params: { journalEntryExportWorkflowPublicId: string; organizationId: string }) {
    const journalEntryExportWorkflow =
      await this.journalEntryExportWorkflowEntityService.getJournalEntryExportWorkflowByOrganizationAndPublicIdAndStatus(
        params.organizationId,
        params.journalEntryExportWorkflowPublicId,
        JournalEntryExportStatus.GENERATED
      )

    if (!journalEntryExportWorkflow) {
      throw new BadRequestException('The given journalEntryExportWorkflow does not exist in the organization')
    }

    await this.journalEntryExportWorkflowEntityService.changeStatus(
      journalEntryExportWorkflow.id,
      JournalEntryExportStatus.EXPORTING
    )

    this.eventEmitter.emit(JournalEntryExportEventType.EXPORT_TO_THIRD_PARTY, journalEntryExportWorkflow.id)

    journalEntryExportWorkflow.status = JournalEntryExportStatus.EXPORTING
    return journalEntryExportWorkflow
  }

  async cancelExportingWorkflow(params: { journalEntryExportWorkflowPublicId: string; organizationId: string }) {
    const journalEntryExportWorkflow =
      await this.journalEntryExportWorkflowEntityService.getJournalEntryExportWorkflowByOrganizationAndPublicIdAndStatus(
        params.organizationId,
        params.journalEntryExportWorkflowPublicId,
        JournalEntryExportStatus.EXPORTING,
        { journalEntries: true }
      )

    if (!journalEntryExportWorkflow) {
      throw new BadRequestException('The given journalEntryExportWorkflow does not exist in the organization')
    }

    let successfulCount = 0
    let failedCount = 0
    for (const journalEntry of journalEntryExportWorkflow.journalEntries) {
      if (journalEntry.status === JournalEntryStatus.EXPORTED) {
        successfulCount++
      } else if (journalEntry.status === JournalEntryStatus.FAILED) {
        failedCount++
      }
    }

    await this.journalEntryExportWorkflowEntityService.changeStatus(
      journalEntryExportWorkflow.id,
      JournalEntryExportStatus.CANCELLED,
      {
        exportedAt: dateHelper.getUTCTimestamp(),
        exportedSuccessfulCount: successfulCount,
        exportedFailedCount: failedCount
      }
    )

    journalEntryExportWorkflow.status = JournalEntryExportStatus.CANCELLED
    return journalEntryExportWorkflow
  }

  async hasNullAccountChildren(organizationId: string, financialTransactionChildIds?: string[]): Promise<boolean> {
    const untaggedChildren: FinancialTransactionChild[] =
      await this.financialTransactionsEntityService.getChildrenByNullChartOfAccount(
        organizationId,
        financialTransactionChildIds
      )

    for (const child of untaggedChildren) {
      if (child.financialTransactionChildMetadata.correspondingChartOfAccount === null) {
        const needCorrespondingCOA =
          this.chartOfAccountRulesDomainService.doesFinancialTransactionChildNeedCorrespondingCOA({
            activity: child.financialTransactionParent.activity,
            type: child.financialTransactionChildMetadata.type,
            gainLossInclusionStatus: child.financialTransactionChildMetadata.gainLossInclusionStatus
          })

        if (needCorrespondingCOA) {
          throw new BadRequestException('Transaction(s) need to be set with chart of account first')
        }
      }
    }

    return true
  }
}
