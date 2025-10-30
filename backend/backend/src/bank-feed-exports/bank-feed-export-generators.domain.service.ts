import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { SwapActivitiesGroup } from '../domain/financial-transformations/interface'
import { CsvStringifierFactory } from '../shared/csv/csv-stringifier-factory'
import { BankFeedExportWorkflow } from '../shared/entity-services/bank-feed-export-workflows/bank-feed-export-workflows.entity'
import { BankFeedExportWorkflowEntityService } from '../shared/entity-services/bank-feed-export-workflows/bank-feed-export-workflows.entity-service'
import { BankFeedExportFileType } from '../shared/entity-services/bank-feed-export-workflows/interface'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { ChartOfAccountMappingsEntityService } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { ChartOfAccountMappingType } from '../shared/entity-services/chart-of-account-mapping/interfaces'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { ContactsEntityService } from '../shared/entity-services/contacts/contacts.entity-service'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataType,
  GainLossInclusionStatus
} from '../shared/entity-services/financial-transactions/interfaces'
import { GainsLossesEntityService } from '../shared/entity-services/gains-losses/gains-losses.entity-service'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { BankFeedExportsDomainService } from './bank-feed-exports.domain.service'
import { AmountDirection, BankFeedExportLine } from './interface'

@Injectable()
export class BankFeedGeneratorsDomainService {
  constructor(
    private walletsService: WalletsEntityService,
    private contactsService: ContactsEntityService,
    private blockchainsEntityService: BlockchainsEntityService,
    private organizationsEntityService: OrganizationsEntityService,
    private bankFeedExportsDomainService: BankFeedExportsDomainService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private bankFeedExportWorkflowEntityService: BankFeedExportWorkflowEntityService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private gainsLossesEntityService: GainsLossesEntityService
  ) {}

  async executeWorkflow(workflow: BankFeedExportWorkflow) {
    const [bankFeedExportLines, transactionCount]: [BankFeedExportLine[], number] =
      await this.generateLinesFromFinancialTransactions(workflow)

    if (transactionCount > 0) {
      await this.bankFeedExportWorkflowEntityService.updateById(workflow.id, {
        totalCount: transactionCount
      })
    }

    let fileData = null

    if (workflow.fileType === BankFeedExportFileType.CSV) {
      fileData = await this.generateCSV({
        organizationId: workflow.organizationId,
        bankFeedExportLines
      })
    }

    const filename = `${dateHelper.getShortDateFormat(workflow.createdAt)} - ${transactionCount} ${
      transactionCount > 1 ? 'Transactions' : 'Transaction'
    }`
    await this.bankFeedExportWorkflowEntityService.updateFilename(workflow.id, filename)

    const organization = await this.organizationsEntityService.findOne({ where: { id: workflow.organizationId } })

    const s3FileKey = await this.bankFeedExportsDomainService.saveBankFeedExportToS3({
      data: fileData,
      publicOrganizationId: organization.publicId,
      workflowId: workflow.publicId,
      fileType: workflow.fileType
    })
    await this.bankFeedExportWorkflowEntityService.updateS3FilePath(workflow.id, s3FileKey)
  }

  async generateLinesFromFinancialTransactions(
    workflow: BankFeedExportWorkflow
  ): Promise<[BankFeedExportLine[], number]> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(
      workflow.organizationId,
      workflow.metadata.walletId
    )

    const coaMappingList = await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
      organizationId: workflow.organizationId,
      relations: { chartOfAccount: true, wallet: true, cryptocurrency: true, recipient: true }
    })

    const contactMap: { [address: string]: ContactDto } =
      await this.contactsService.getGroupedContactDtosByAddressPerOrganization(workflow.organizationId)

    const blockchain = await this.blockchainsEntityService.getByPublicId(workflow.metadata.blockchainId)
    const organizationSetting = await this.organizationSettingsService.getByOrganizationId(workflow.organizationId, {
      timezone: true
    })

    const bankFeedExportLines: BankFeedExportLine[] = []

    let skip = 0
    const batchSize = 500
    let financialTransactionChildren: FinancialTransactionChild[] = []

    do {
      financialTransactionChildren =
        await this.financialTransactionsEntityService.getChildrenByAddressAndBlockchainIdAndCryptocurrencyId({
          address: wallet.address,
          blockchainId: blockchain.publicId,
          organizationId: workflow.organizationId,
          cryptocurrencyId: workflow.metadata.cryptocurrencyId,
          skip,
          take: batchSize,
          startTime: workflow.metadata.startTime,
          endTime: workflow.metadata.endTime
        })

      if (financialTransactionChildren.length) {
        for (const child of financialTransactionChildren) {
          const metadata = child.financialTransactionChildMetadata
          const parent = child.financialTransactionParent

          const descriptionPrefix = `${metadata.type.charAt(0).toUpperCase().concat(metadata.type.slice(1))}`
          const cryptocurrencySection = `${child.cryptocurrencyAmount} ${child.cryptocurrency.symbol}`
          const descriptionWithoutContactPrefix = `${descriptionPrefix} - ${cryptocurrencySection}`

          const fromContact = contactMap[child.fromAddress] ? contactMap[child.fromAddress].name : child.fromAddress
          const toContact = contactMap[child.toAddress] ? contactMap[child.toAddress].name : child.toAddress
          const contactSection = toContact ? `'${fromContact}' to '${toContact}'` : `'${fromContact}'`
          const descriptionWithContactPrefix = `${descriptionPrefix} - ${cryptocurrencySection} - ${contactSection}`

          const zonedDate = dateHelper.utcToZonedTime(child.valueTimestamp, organizationSetting.timezone.utcOffset)

          if (metadata.gainLossInclusionStatus === GainLossInclusionStatus.INTERNAL) {
            // Bank feed only needs to reflect the outgoing leg of internal transfer
            if (metadata.direction === FinancialTransactionChildMetadataDirection.INCOMING) {
              continue
            }

            if (child.fromAddress !== child.toAddress) {
              bankFeedExportLines.push(
                this.createBankFeedExportLine({
                  date: zonedDate,
                  amount: metadata.costBasis,
                  amountDirection: AmountDirection.CREDIT,
                  description: descriptionWithContactPrefix,
                  reference: child.hash
                })
              )
            }
          } else {
            // Normal external outgoing/incoming flow

            // Default assumes incoming direction
            let amount = '0'
            let payee = null
            if (metadata.direction === FinancialTransactionChildMetadataDirection.INCOMING) {
              let tempAmount = new Decimal(0)
              const taxLots = await this.gainsLossesEntityService.getTaxLotsByChildId(child.id)
              for (const taxLot of taxLots) {
                tempAmount = tempAmount.add(Decimal.mul(taxLot.amountTotal, taxLot.costBasisPerUnit))
              }
              amount = tempAmount.toString()
              payee = fromContact
            }

            let amountDirection = AmountDirection.DEBIT
            let description = descriptionWithoutContactPrefix
            if (metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING) {
              amountDirection = AmountDirection.CREDIT
              amount = metadata.costBasis
              payee = toContact

              // Amount is from incoming for swap
              if (SwapActivitiesGroup.includes(parent.activity)) {
                const parentWithChildren = await this.financialTransactionsEntityService.getParentById(parent.id, {
                  financialTransactionChild: { financialTransactionChildMetadata: true, cryptocurrency: true }
                })

                const incomingChild = parentWithChildren.financialTransactionChild.find(
                  (child) =>
                    child.financialTransactionChildMetadata.direction ===
                    FinancialTransactionChildMetadataDirection.INCOMING
                )

                let tempAmount = new Decimal(0)
                const taxLots = await this.gainsLossesEntityService.getTaxLotsByChildId(incomingChild.id)
                for (const taxLot of taxLots) {
                  tempAmount = tempAmount.add(Decimal.mul(taxLot.amountTotal, taxLot.costBasisPerUnit))
                }
                amount = tempAmount.toString()
                payee = null

                description = `${parent.activity
                  .charAt(0)
                  .toUpperCase()
                  .concat(parent.activity.slice(1))} - ${description} - ${incomingChild.cryptocurrencyAmount} ${
                  incomingChild.cryptocurrency.symbol
                }`
              }
            }

            let account = ''

            if (
              !SwapActivitiesGroup.includes(parent.activity) ||
              metadata.type === FinancialTransactionChildMetadataType.FEE
            ) {
              account = metadata.correspondingChartOfAccount?.code
            }

            bankFeedExportLines.push(
              this.createBankFeedExportLine({
                date: zonedDate,
                amount,
                amountDirection: amountDirection,
                account,
                description,
                reference: child.hash,
                payee
              })
            )

            // Gain loss flow
            if (
              metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING &&
              metadata.gainLoss &&
              metadata.gainLoss !== '0'
            ) {
              const gainLoss = new Decimal(metadata.gainLoss)

              const gainLossAmountDirection =
                gainLoss.comparedTo(0) > 0 ? AmountDirection.DEBIT : AmountDirection.CREDIT
              const gainLossDescription = gainLoss.comparedTo(0) > 0 ? 'Gain' : 'Loss'
              const gainOrLossCoa = coaMappingList.find(
                (mapping) =>
                  mapping.type ===
                  (gainLoss.comparedTo(0) > 0 ? ChartOfAccountMappingType.GAIN : ChartOfAccountMappingType.LOSS)
              )

              let gainLossFullDescription = `${descriptionPrefix} - ${gainLossDescription} - ${cryptocurrencySection}`

              if (SwapActivitiesGroup.includes(parent.activity)) {
                const parentWithChildren = await this.financialTransactionsEntityService.getParentById(parent.id, {
                  financialTransactionChild: { financialTransactionChildMetadata: true, cryptocurrency: true }
                })

                const incomingChild = parentWithChildren.financialTransactionChild.find(
                  (child) =>
                    child.financialTransactionChildMetadata.direction ===
                    FinancialTransactionChildMetadataDirection.INCOMING
                )

                gainLossFullDescription = `${parent.activity
                  .charAt(0)
                  .toUpperCase()
                  .concat(parent.activity.slice(1))} - ${gainLossDescription} - ${cryptocurrencySection} - ${
                  incomingChild.cryptocurrencyAmount
                } ${incomingChild.cryptocurrency.symbol}`
              }

              bankFeedExportLines.push(
                this.createBankFeedExportLine({
                  date: zonedDate,
                  amount: gainLoss.abs().toString(),
                  amountDirection: gainLossAmountDirection,
                  account: gainOrLossCoa?.chartOfAccount?.code ?? '',
                  description: gainLossFullDescription,
                  reference: child.hash
                })
              )
            }
          }
        }
      }
      skip += financialTransactionChildren.length
    } while (financialTransactionChildren.length === batchSize)

    return [bankFeedExportLines, skip]
  }

  async generateCSV(params: { organizationId: string; bankFeedExportLines: BankFeedExportLine[] }): Promise<string> {
    const csvStringifier = CsvStringifierFactory.createArrayCsvStringifier({
      header: ['Date', 'Amount', 'Payee', 'Account code', 'Description', 'Reference']
    })

    const csvData: string[][] = params.bankFeedExportLines.map((line) => [
      line.date,
      line.amount,
      line.payee,
      line.account,
      line.description,
      line.reference
    ])

    return csvStringifier.getCsvString(csvData)
  }

  createBankFeedExportLine(params: {
    date: Date
    amount: string
    amountDirection: AmountDirection
    description: string
    reference: string
    account?: string
    payee?: string
  }): BankFeedExportLine {
    const multiplier = params.amountDirection === AmountDirection.DEBIT ? new Decimal(1) : new Decimal(-1)
    const bankFeedExportLine: BankFeedExportLine = {
      date: dateHelper.getShortDateFormat(params.date),
      amount: multiplier.mul(params.amount).toString(),
      payee: params.payee ?? '',
      account: params.account ?? '',
      description: params.description ?? '',
      reference: params.reference ?? ''
    }

    return bankFeedExportLine
  }
}
