import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { DeepPartial } from 'typeorm'
import { ChartOfAccountMapping } from '../../shared/entity-services/chart-of-account-mapping/chart-of-account-mapping.entity'
import { ChartOfAccountMappingsEntityService } from '../../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { ChartOfAccountMappingType } from '../../shared/entity-services/chart-of-account-mapping/interfaces'
import { ContactDto } from '../../shared/entity-services/contacts/contact'
import { ContactsEntityService } from '../../shared/entity-services/contacts/contacts.entity-service'
import { FinancialTransactionParent } from '../../shared/entity-services/financial-transactions/financial-transaction-parent.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataType,
  FinancialTransactionParentExportStatus,
  GainLossInclusionStatus
} from '../../shared/entity-services/financial-transactions/interfaces'
import { GainsLossesEntityService } from '../../shared/entity-services/gains-losses/gains-losses.entity-service'
import {
  JournalEntryStatus,
  JournalEntryStatusReason,
  JournalLineEntryType
} from '../../shared/entity-services/journal-entries/interfaces'
import { JournalEntriesEntityService } from '../../shared/entity-services/journal-entries/journal-entries.entity-service'
import { JournalEntry } from '../../shared/entity-services/journal-entries/journal-entry.entity'
import { JournalLine } from '../../shared/entity-services/journal-entries/journal-line.entity'
import { JournalEntryExportType } from '../../shared/entity-services/journal-entry-export-workflows/interfaces'
import { JournalEntryExportWorkflow } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflow.entity'
import { JournalEntryExportWorkflowEntityService } from '../../shared/entity-services/journal-entry-export-workflows/journal-entry-export-workflows.entity-service'
import { Wallet } from '../../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { SwapActivitiesGroup } from '../financial-transformations/interface'

@Injectable()
export class JournalEntryGeneratorsDomainService {
  constructor(
    private logger: LoggerService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private journalEntriesEntityService: JournalEntriesEntityService,
    private journalEntryExportWorkflowEntityService: JournalEntryExportWorkflowEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private walletsEntityService: WalletsEntityService,
    private contactsService: ContactsEntityService,
    private gainsLossesEntityService: GainsLossesEntityService
  ) {}

  async executeWorkflow(workflow: JournalEntryExportWorkflow) {
    // Initialized the journal entries first. Take note of retry scenarios
    let initializedJournalEntries: JournalEntry[] = []
    if (workflow.journalEntries?.length) {
      initializedJournalEntries = workflow.journalEntries
    } else {
      const financialTransactionParentSourceIds: string[] = await this.getParentIdsFromWorkflow(workflow)

      initializedJournalEntries = await this.journalEntriesEntityService.initializeJournalEntryForParents({
        parentIds: financialTransactionParentSourceIds,
        organizationId: workflow.organizationId,
        workflowId: workflow.id
      })

      if (financialTransactionParentSourceIds?.length) {
        await this.journalEntryExportWorkflowEntityService.updateById(workflow.id, {
          totalCount: financialTransactionParentSourceIds?.length
        })
      }
    }

    // Get the necessary data points and generate the journal entries
    const chartOfAccountMappings =
      await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
        organizationId: workflow.organizationId,
        relations: { chartOfAccount: true, wallet: true, cryptocurrency: true, recipient: true }
      })
    const walletMap = await this.walletsEntityService.getAllByOrganizationIdGroupedByAddress(workflow.organizationId)

    const contactMap: { [address: string]: ContactDto } =
      await this.contactsService.getGroupedContactDtosByAddressPerOrganization(workflow.organizationId)

    for (const initializedJournalEntry of initializedJournalEntries) {
      await this.generateJournalEntry(initializedJournalEntry, walletMap, chartOfAccountMappings, contactMap)
    }
  }

  async getParentIdsFromWorkflow(workflow: JournalEntryExportWorkflow): Promise<string[]> {
    let parents: FinancialTransactionParent[] = []
    if (workflow.type === JournalEntryExportType.ALL) {
      parents = await this.financialTransactionsEntityService.getParentsByOrganizationId(workflow.organizationId, {
        id: true
      })
      return parents.map((parent) => parent.id)
    } else if (workflow.type === JournalEntryExportType.UNEXPORTED) {
      parents = await this.financialTransactionsEntityService.getParentsByOrganizationIdAndExportStatuses(
        workflow.organizationId,
        [FinancialTransactionParentExportStatus.UNEXPORTED],
        { id: true }
      )
    } else if (workflow.type === JournalEntryExportType.MANUAL) {
      return workflow.metadata?.financialTransactionParentIds
    } else if (workflow.type === JournalEntryExportType.FILTERED) {
      return workflow.metadata?.financialTransactionParentIds
    } else {
      const message = 'JournalEntryGeneratorsDomainService unsupported journal entry export workflow type'
      this.logger.error(message, workflow)
      throw Error(message)
    }

    return parents.map((parent) => parent.id)
  }

  async generateJournalEntry(
    journalEntry: JournalEntry,
    walletMap: Map<string, Wallet>,
    coaMappingList: ChartOfAccountMapping[],
    contactMap: { [address: string]: ContactDto }
  ) {
    const parentTransaction = await this.financialTransactionsEntityService.getParentById(
      journalEntry.financialTransactionParent.id,
      {
        financialTransactionChild: {
          financialTransactionChildMetadata: { correspondingChartOfAccount: true },
          cryptocurrency: true
        }
      }
    )

    if (journalEntry.status === JournalEntryStatus.CREATED) {
      const narration =
        (parentTransaction.remark ?? `${parentTransaction.activity} - ${parentTransaction.hash}`) +
        ` - Journal Created At - ${new Date().toISOString()}`

      await this.journalEntriesEntityService.updateById(journalEntry.id, {
        transactionDate: parentTransaction.valueTimestamp,
        integrationParams: { xero: { narration: narration } },
        memo: parentTransaction.activity,
        status: JournalEntryStatus.GENERATING
      })
    }

    let journalLineTemplates: DeepPartial<JournalLine>[] = []

    const orderedChildren = []
    const nonFeeChildren = []
    const feeChildren = []
    for (const child of parentTransaction.financialTransactionChild) {
      if (child.financialTransactionChildMetadata.type === FinancialTransactionChildMetadataType.FEE) {
        feeChildren.push(child)
      } else {
        nonFeeChildren.push(child)
      }
    }

    orderedChildren.push(...nonFeeChildren, ...feeChildren)

    try {
      for (const child of orderedChildren) {
        const metadata = child.financialTransactionChildMetadata
        const descriptionPrefix = `${metadata.type}`
        const cryptocurrencySection = `${child.cryptocurrencyAmount} ${child.cryptocurrency.symbol}`

        const fromContact = contactMap[child.fromAddress] ? contactMap[child.fromAddress].name : child.fromAddress
        const toContact = contactMap[child.toAddress] ? contactMap[child.toAddress].name : child.toAddress
        const contactSection = toContact ? `'${fromContact}' to '${toContact}'` : `'${fromContact}'`

        const descriptionWithAddressPrefix = `${descriptionPrefix} - ${cryptocurrencySection} - ${contactSection}`
        // Internal type is always a pair so we only need to produce 1 journal line each
        if (metadata.gainLossInclusionStatus === GainLossInclusionStatus.INTERNAL) {
          if (child.fromAddress !== child.toAddress) {
            const address =
              metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
                ? child.fromAddress
                : child.toAddress
            const wallet = walletMap.get(address)
            const coaMapping = this.chartOfAccountMappingsEntityService.getChartOfAccountFromMappingForWallet(
              coaMappingList,
              wallet.id,
              child.cryptocurrency?.id
            )

            let amount = metadata.costBasis
            if (metadata.direction === FinancialTransactionChildMetadataDirection.INCOMING) {
              let tempAmount = new Decimal(0)
              const taxLots = await this.gainsLossesEntityService.getTaxLotsByChildId(child.id)
              for (const taxLot of taxLots) {
                tempAmount = tempAmount.add(Decimal.mul(taxLot.amountTotal, taxLot.costBasisPerUnit))
              }
              amount = tempAmount.toString()
            }

            const entryType =
              metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
                ? JournalLineEntryType.CREDIT
                : JournalLineEntryType.DEBIT
            journalLineTemplates.push(
              this.journalEntriesEntityService.createJournalLineTemplate({
                journalEntryId: journalEntry.id,
                amount,
                entryType: entryType,
                chartOfAccountId: coaMapping.chartOfAccount.id,
                description: descriptionWithAddressPrefix
              })
            )
          }
        } else {
          // For all other scenario, every child will need to produce at least 2 entries

          // Wallet flow
          const wallet = walletMap.get(
            metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
              ? child.fromAddress
              : child.toAddress
          )
          const coaMapping = this.chartOfAccountMappingsEntityService.getChartOfAccountFromMappingForWallet(
            coaMappingList,
            wallet.id,
            child.cryptocurrency?.id
          )

          let amount = metadata.costBasis
          if (metadata.direction === FinancialTransactionChildMetadataDirection.INCOMING) {
            let tempAmount = new Decimal(0)
            const taxLots = await this.gainsLossesEntityService.getTaxLotsByChildId(child.id)
            for (const taxLot of taxLots) {
              tempAmount = tempAmount.add(Decimal.mul(taxLot.amountTotal, taxLot.costBasisPerUnit))
            }
            amount = tempAmount.toString()
          }

          journalLineTemplates.push(
            this.journalEntriesEntityService.createJournalLineTemplate({
              journalEntryId: journalEntry.id,
              amount: amount,
              entryType:
                metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
                  ? JournalLineEntryType.CREDIT
                  : JournalLineEntryType.DEBIT,
              chartOfAccountId: coaMapping.chartOfAccount.id,
              description: descriptionWithAddressPrefix
            })
          )

          // Corresponding flow
          if (
            !SwapActivitiesGroup.includes(parentTransaction.activity) ||
            metadata.type === FinancialTransactionChildMetadataType.FEE
          ) {
            if (!metadata.correspondingChartOfAccount) {
              const message = `Journal Entry Generator fails as correspondingChartOfAccount is missing for child ${child.id}`
              this.logger.error(message, child)
              throw new Error(message)
            }

            journalLineTemplates.push(
              this.journalEntriesEntityService.createJournalLineTemplate({
                journalEntryId: journalEntry.id,
                amount: metadata.fiatAmount,
                entryType:
                  metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
                    ? JournalLineEntryType.DEBIT
                    : JournalLineEntryType.CREDIT,
                chartOfAccountId: metadata.correspondingChartOfAccount.id,
                description: descriptionWithAddressPrefix
              })
            )
          }

          // Gain loss flow
          if (
            metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING &&
            metadata.gainLoss &&
            metadata.gainLoss !== '0'
          ) {
            const gainLoss = new Decimal(metadata.gainLoss)

            const entryType = gainLoss.comparedTo(0) > 0 ? JournalLineEntryType.CREDIT : JournalLineEntryType.DEBIT
            const gainLossDescription = gainLoss.comparedTo(0) > 0 ? 'Gain' : 'Loss'
            const gainOrLossCoa = coaMappingList.find(
              (mapping) =>
                mapping.type ===
                (gainLoss.comparedTo(0) > 0 ? ChartOfAccountMappingType.GAIN : ChartOfAccountMappingType.LOSS)
            )

            journalLineTemplates.push(
              this.journalEntriesEntityService.createJournalLineTemplate({
                journalEntryId: journalEntry.id,
                amount: gainLoss.abs().toString(),
                entryType: entryType,
                chartOfAccountId: gainOrLossCoa.chartOfAccount.id,
                description: `${descriptionPrefix} - ${gainLossDescription} - ${cryptocurrencySection} - ${contactSection}`
              })
            )
          }
        }
      }

      if (SwapActivitiesGroup.includes(parentTransaction.activity)) {
        const depositWithdrawalTransactions: DeepPartial<JournalLine>[] = []
        const gainLossTransactions: DeepPartial<JournalLine>[] = []
        const feeAndRoundingTransactions: DeepPartial<JournalLine>[] = []

        for (const template of journalLineTemplates) {
          if (template.description.startsWith('fee -') || template.description === 'Rounding') {
            feeAndRoundingTransactions.push(template)
          } else if (template.description.includes('- Gain -') || template.description.includes('- Loss -')) {
            gainLossTransactions.push(template)
          } else {
            depositWithdrawalTransactions.push(template)
          }
        }
        journalLineTemplates = []
        journalLineTemplates.push(
          ...depositWithdrawalTransactions.filter((txn) => txn.entryType === JournalLineEntryType.CREDIT),
          ...depositWithdrawalTransactions.filter((txn) => txn.entryType === JournalLineEntryType.DEBIT),
          ...gainLossTransactions,
          ...feeAndRoundingTransactions
        )
      }

      journalLineTemplates = journalLineTemplates.filter((journalLine) => journalLine.netAmount !== '0')
      const totalAmount = journalLineTemplates.reduce((sum, curr) => Decimal.add(sum, curr.netAmount), new Decimal(0))

      if (totalAmount.comparedTo(0) !== 0) {
        // Since debit/credit is a pair of line, there can be at most 0.01 rounding error per 2 lines of debit/credit
        const thresholdForRounding = (journalLineTemplates.length / 2) * 0.01
        if (totalAmount.abs().comparedTo(thresholdForRounding) < 1) {
          const entryType = totalAmount.comparedTo(0) > 0 ? JournalLineEntryType.CREDIT : JournalLineEntryType.DEBIT
          const coaMapping = coaMappingList.find((mapping) => mapping.type === ChartOfAccountMappingType.ROUNDING)

          journalLineTemplates.push(
            this.journalEntriesEntityService.createJournalLineTemplate({
              journalEntryId: journalEntry.id,
              amount: totalAmount.abs().toString(),
              entryType: entryType,
              chartOfAccountId: coaMapping.chartOfAccount.id,
              description: `Rounding`
            })
          )
        } else {
          const message = `JournalEntryGeneratorsDomainService failed due to amount mismatch for journalEntry ${journalEntry.id}`
          this.logger.error(message, journalEntry, journalLineTemplates)
          throw Error(JournalEntryStatusReason.AMOUNT_MISMATCH)
        }
      }
    } catch (e) {
      await this.financialTransactionsEntityService.updateParentIdWithExportStatusAndReason(
        journalEntry.financialTransactionParent?.id,
        FinancialTransactionParentExportStatus.FAILED,
        'Generate failed = ' + (e.stack ?? e.message ?? e)
      )

      await this.journalEntriesEntityService.updateJournalEntryWithStatusAndStatusReason(
        journalEntry.id,
        JournalEntryStatus.FAILED,
        e.stack ?? e.message ?? e
      )
      journalEntry.status = JournalEntryStatus.FAILED
    }

    let lineNumber = 1
    // To prevent duplicate line
    for (const journalLineTemplate of journalLineTemplates) {
      journalLineTemplate.description = `${lineNumber++} - ` + journalLineTemplate.description
    }
    await this.journalEntriesEntityService.saveJournalLineTemplates(journalLineTemplates)

    if (journalEntry.status !== JournalEntryStatus.FAILED) {
      await this.journalEntriesEntityService.updateJournalEntryWithStatusAndStatusReason(
        journalEntry.id,
        JournalEntryStatus.READY_TO_EXPORT,
        null
      )
    }
  }
}
