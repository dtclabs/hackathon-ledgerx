import { BadRequestException, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FilesService } from '../files/files.service'
import { BucketSelector } from '../files/interfaces'
import { FinancialTransactionQueryParams } from '../financial-transactions/interfaces'
import { FinancialTransactionExportWorkflowEntityService } from '../shared/entity-services/financial-transaction-export-workflows/financial-transaction-export-workflows.entity-service'
import { FinancialTransactionExportWorkflow } from '../shared/entity-services/financial-transaction-export-workflows/financial-transaction-export-workflows.entity'
import {
  FinancialTransactionExportFileType,
  FinancialTransactionExportStatus,
  FinancialTransactionExportType
} from '../shared/entity-services/financial-transaction-export-workflows/interface'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import {
  FinancialTransactionExportDto,
  FinancialTransactionExportEventType,
  MAX_FINANCIAL_TRANSACTION_EXPORT_WORKFLOWS
} from './interface'
import { dateHelper } from '../shared/helpers/date.helper'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'

@Injectable()
export class FinancialTransactionExportsDomainService {
  constructor(
    private logger: LoggerService,
    private financialTransactionExportWorkflowEntityService: FinancialTransactionExportWorkflowEntityService,
    private filesService: FilesService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async getFinancialTransactionExportsForOrganization(
    organizationId: string
  ): Promise<FinancialTransactionExportDto[]> {
    const financialTransactionExports =
      await this.financialTransactionExportWorkflowEntityService.getFinancialTransactionExportWorkflowsByOrganization({
        organizationId
      })

    if (financialTransactionExports?.length) {
      const filteredExports: FinancialTransactionExportWorkflow[] = []

      for (const financialTransactionExport of financialTransactionExports) {
        if (filteredExports.length >= MAX_FINANCIAL_TRANSACTION_EXPORT_WORKFLOWS) {
          break
        }
        filteredExports.push(financialTransactionExport)
      }

      return filteredExports.map((FinancialTransactionExport) =>
        FinancialTransactionExportDto.map(FinancialTransactionExport)
      )
    }
  }

  async createFinancialTransactionExport(params: {
    organizationId: string
    requestedBy: string
    type: FinancialTransactionExportType
    fileType: FinancialTransactionExportFileType
    financialTransactionPublicIds?: string[]
    query: FinancialTransactionQueryParams
  }): Promise<FinancialTransactionExportDto> {
    if (params.type !== FinancialTransactionExportType.ALL && params?.query && Object.keys(params?.query).length) {
      throw new BadRequestException('Query(s) are not required for this export type')
    }

    if (params.type !== FinancialTransactionExportType.MANUAL && params.financialTransactionPublicIds?.length) {
      throw new BadRequestException('Transaction id(s) are not required for this export type')
    }

    if (params.type === FinancialTransactionExportType.MANUAL && !params.financialTransactionPublicIds?.length) {
      throw new BadRequestException('Manual export needs financial transaction id(s)')
    }

    const runningWorfklows =
      await this.financialTransactionExportWorkflowEntityService.getRunningWorkflowsByOrganization(
        params.organizationId
      )

    if (runningWorfklows?.length) {
      throw new BadRequestException(
        'Unable to start a new financial transaction export while another workflow is running '
      )
    }

    let financialTransactions: FinancialTransactionChild[] = []

    if (params.financialTransactionPublicIds?.length) {
      financialTransactions = await this.financialTransactionsEntityService.getAllChildrenByOrganizationIdAndPublicIds(
        params.organizationId,
        params.financialTransactionPublicIds
      )

      if (params.financialTransactionPublicIds?.length !== financialTransactions?.length) {
        throw new BadRequestException('Invalid transactions id(s) for financial transaction export')
      }
    }

    const financialTransactionIds = financialTransactions.map((transaction) => transaction.id)

    const workflow = await this.financialTransactionExportWorkflowEntityService.createWorkflow({
      organizationId: params.organizationId,
      requestedBy: params.requestedBy,
      type: params.type,
      financialTransactionIds: financialTransactionIds,
      fileType: params.fileType,
      query: params.query
    })

    this.eventEmitter.emit(FinancialTransactionExportEventType.GENERATE_FROM_FINANCIAL_TRANSACTION, workflow.id)

    return FinancialTransactionExportDto.map(workflow)
  }

  async getFinancialTransactionExportFile(params: {
    financialTransactionWorkflowPublicId: string
    organizationId: string
  }) {
    const workflow = await this.financialTransactionExportWorkflowEntityService.findOne({
      where: {
        publicId: params.financialTransactionWorkflowPublicId,
        organizationId: params.organizationId
      }
    })

    const transactionCount = `${workflow.totalCount} ${workflow.totalCount > 1 ? 'Transactions' : 'Transaction'}`

    const filename = `${dateHelper.getShortDateFormat(workflow.createdAt)}${
      workflow.totalCount !== null ? ` - ${transactionCount}` : ''
    }`

    if (!workflow) {
      throw new BadRequestException('Invalid financial transaction export workflow id')
    }
    if (workflow.status === FinancialTransactionExportStatus.GENERATING) {
      throw new BadRequestException('Financial transaction export workflow is generating')
    }
    if (!workflow.s3FileName || workflow.status !== FinancialTransactionExportStatus.COMPLETED) {
      throw new BadRequestException('Can not download failed financial transaction export')
    }

    const fileKey = workflow?.s3FileName

    const { fileStream, mimeType } = await this.filesService.getExportFileStream(BucketSelector.PRIVATE, fileKey)

    return { filename, mimeType, fileStream }
  }

  async saveExportToS3(params: {
    data: string
    publicOrganizationId: string
    workflowId: string
    fileType: FinancialTransactionExportFileType
  }) {
    try {
      const path = `organizations/files/${params.publicOrganizationId}/export/${params.workflowId}`

      const fileContents = Buffer.from(params.data)

      const { key } = await this.filesService.uploadToS3(fileContents, path, BucketSelector.PRIVATE, params.fileType)

      return key
    } catch (e) {
      this.logger.error(`Can not save financial transaction export file to S3`, e, {
        publicOrganizationId: params.publicOrganizationId
      })
    }
  }
}
