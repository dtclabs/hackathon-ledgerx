import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { FinancialTransactionsDomainService } from '../financial-transactions/financial-transactions.domain.service'
import { FinancialTransactionQueryParams } from '../financial-transactions/interfaces'
import { CsvStringifierFactory } from '../shared/csv/csv-stringifier-factory'
import { csvUtils } from '../shared/csv/utils'
import { Blockchain } from '../shared/entity-services/blockchains/blockchain.entity'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { FinancialTransactionExportWorkflow } from '../shared/entity-services/financial-transaction-export-workflows/financial-transaction-export-workflows.entity'
import { FinancialTransactionExportWorkflowEntityService } from '../shared/entity-services/financial-transaction-export-workflows/financial-transaction-export-workflows.entity-service'
import { FinancialTransactionExportFileType } from '../shared/entity-services/financial-transaction-export-workflows/interface'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { FinancialTransactionChildMetadataDirection } from '../shared/entity-services/financial-transactions/interfaces'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { getBlockExplorerUrlToAddress, getBlockExplorerUrlToTransaction } from '../shared/utils/utils'
import { FinancialTransactionExportsDomainService } from './financial-transaction-exports.domain.service'

@Injectable()
export class FinancialTransactionGeneratorsDomainService {
  constructor(
    private logger: LoggerService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private financialTransactionsDomainService: FinancialTransactionsDomainService,
    private blockchainsEntityService: BlockchainsEntityService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private organizationsEntityService: OrganizationsEntityService,
    private financialTransactionExportsDomainService: FinancialTransactionExportsDomainService,
    private financialTransactionExportWorkflowEntityService: FinancialTransactionExportWorkflowEntityService
  ) {}

  async executeWorkflow(workflow: FinancialTransactionExportWorkflow) {
    const blockchains = await this.blockchainsEntityService.getEnabledFromOrDefaultIfEmpty(
      workflow.metadata.query?.blockchainIds
    )

    const financialTransactions = await this.getFinancialTransactionsFromWorkflow(workflow, blockchains)

    if (financialTransactions.length > 0) {
      await this.financialTransactionExportWorkflowEntityService.updateById(workflow.id, {
        totalCount: financialTransactions.length
      })
    }

    let data = null

    if (workflow.fileType === FinancialTransactionExportFileType.CSV) {
      data = await this.getTxsCSV({
        organizationId: workflow.organizationId,
        financialTransactions,
        blockchains
      })
    }

    const organization = await this.organizationsEntityService.findOne({ where: { id: workflow.organizationId } })

    const fileName = await this.financialTransactionExportsDomainService.saveExportToS3({
      data: data,
      publicOrganizationId: organization.publicId,
      workflowId: workflow.publicId,
      fileType: workflow.fileType
    })

    await this.financialTransactionExportWorkflowEntityService.updateS3FileName(workflow.id, fileName)
  }

  async getTxsCSV(params: {
    organizationId: string
    financialTransactions: FinancialTransactionChild[]
    blockchains: Blockchain[]
  }): Promise<string> {
    const csvStringifier = CsvStringifierFactory.createArrayCsvStringifier({
      header: [
        'Date Time',
        'Txn Hash',
        'Type',
        'From Wallet',
        'To Wallet',
        'Token Name',
        'Token Amount In',
        'Token Amount Out',
        'Fiat Value In',
        'Fiat Value Out',
        'Realised Gains/Loss',
        'Account',
        'Tags', // This is a product naming to correspond to the columns in the UI, this should be annotation in the future
        'Notes',
        'Blockchain'
      ]
    })
    let csvData: string[][] = []

    csvData = await this.getAndConvertToCSV({
      organizationId: params.organizationId,
      blockchains: params.blockchains,
      financialTransactions: params.financialTransactions
    })

    return csvStringifier.getCsvString(csvData)
  }

  async getFinancialTransactionsFromWorkflow(
    workflow: FinancialTransactionExportWorkflow,
    blockchains: Blockchain[]
  ): Promise<FinancialTransactionChild[]> {
    let result: FinancialTransactionChild[] = []

    if (workflow.metadata?.financialTransactionIds?.length) {
      result = await this.financialTransactionsEntityService.getAllChildrenByOrganizationIdAndIds(
        workflow.organizationId,
        workflow.metadata?.financialTransactionIds,
        {
          financialTransactionChildMetadata: { correspondingChartOfAccount: true },
          financialTransactionParent: true,
          cryptocurrency: { addresses: true },
          financialTransactionChildAnnotations: { annotation: true }
        }
      )
      // for export all
    } else {
      let page = 0
      const pageSize = 500
      let paginatedData: FinancialTransactionChild[] = []
      const formatedQuery: FinancialTransactionQueryParams = { ...workflow.metadata.query }

      if (formatedQuery.toFiatAmount) {
        formatedQuery.toFiatAmount = new Decimal(formatedQuery.toFiatAmount)
      }
      if (formatedQuery.fromFiatAmount) {
        formatedQuery.fromFiatAmount = new Decimal(formatedQuery.fromFiatAmount)
      }
      formatedQuery.blockchainIds = blockchains.map((b) => b.publicId)

      do {
        paginatedData = await this.financialTransactionsEntityService.getAllChildren(
          formatedQuery,
          workflow.organizationId,
          page,
          pageSize
        )
        result.push(...paginatedData)
        page++
      } while (paginatedData.length === pageSize)
    }

    return result
  }

  async getAndConvertToCSV(params: {
    organizationId: string
    blockchains: Blockchain[]
    financialTransactions: FinancialTransactionChild[]
  }) {
    const financialTransactionDtos = await this.financialTransactionsDomainService.convertToDto(
      params.organizationId,
      params.financialTransactions
    )

    const data: string[][] = []
    const organizationSetting = await this.organizationSettingsService.getByOrganizationId(params.organizationId, {
      timezone: true
    })

    for (const transaction of financialTransactionDtos) {
      const blockchain = params.blockchains.find((b) => b.publicId === transaction.blockchainId)

      if (!blockchain) {
        this.logger.error(`Can not find blockchain ${transaction.blockchainId}`, {
          blockchainId: transaction.blockchainId,
          financialTransactionId: transaction.id,
          organizationId: params.organizationId
        })
      }

      const txUrl = getBlockExplorerUrlToTransaction(blockchain, transaction.hash)

      const fromWalletUrl = getBlockExplorerUrlToAddress(blockchain, transaction.fromAddress)
      const fromWalletName = transaction.fromContact?.name ?? transaction.fromAddress

      const toWalletUrl = getBlockExplorerUrlToAddress(blockchain, transaction.toAddress)
      const toWalletName = transaction.toContact?.name ?? transaction.toAddress

      const tokenAddress = transaction.cryptocurrency.addresses.find(
        (a) => a.blockchainId === transaction.blockchainId
      )?.address
      const tokenUrl = getBlockExplorerUrlToAddress(blockchain, tokenAddress)
      const tokenName = transaction.cryptocurrency.symbol

      const isIn = transaction.direction === FinancialTransactionChildMetadataDirection.INCOMING
      const isOut = transaction.direction === FinancialTransactionChildMetadataDirection.OUTGOING

      const zonedDate = dateHelper.utcToZonedTime(transaction.valueTimestamp, organizationSetting.timezone.utcOffset)
      const coa = transaction.correspondingChartOfAccount
        ? transaction.correspondingChartOfAccount.code
          ? `${transaction.correspondingChartOfAccount.code}-${transaction.correspondingChartOfAccount.name}`
          : `${transaction.correspondingChartOfAccount.name}`
        : ''
      const annotationNames = transaction.annotations?.map((annotation) => annotation.name).join(',')
      data.push([
        dateHelper.toISO8061String(zonedDate, organizationSetting.timezone.utcOffset),
        csvUtils.getHyperlink(txUrl, transaction.hash),
        transaction.typeDetail.label,
        fromWalletName ? csvUtils.getHyperlink(fromWalletUrl, fromWalletName) : '',
        toWalletName ? csvUtils.getHyperlink(toWalletUrl, toWalletName) : '',
        tokenAddress ? csvUtils.getHyperlink(tokenUrl, tokenName) : tokenName,
        isIn ? transaction.cryptocurrencyAmount : '',
        isOut ? transaction.cryptocurrencyAmount : '',
        isIn ? transaction.fiatAmount : '',
        isOut ? transaction.fiatAmount : '',
        transaction.gainLoss ?? '',
        coa,
        annotationNames,
        transaction.note,
        transaction.blockchainId
      ])
    }

    return data
  }
}
