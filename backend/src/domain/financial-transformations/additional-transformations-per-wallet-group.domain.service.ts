import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import Decimal from 'decimal.js'
import { TaskStatusEnum } from '../../core/events/event-types'
import { AdditionalTransformationPerWalletGroupTask } from '../../shared/entity-services/additional-transformation-per-wallet-group-tasks/additional-transformation-per-wallet-group-task.entity'
import { AdditionalTransformationPerWalletGroupTasksEntityService } from '../../shared/entity-services/additional-transformation-per-wallet-group-tasks/additional-transformation-per-wallet-group-tasks.entity-service'
import { FeatureFlagsEntityService } from '../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataStatus,
  FinancialTransactionChildMetadataSubstatus,
  FinancialTransactionChildMetadataType,
  FinancialTransactionParentActivity,
  GainLossInclusionStatus
} from '../../shared/entity-services/financial-transactions/interfaces'
import { GainsLossesEntityService } from '../../shared/entity-services/gains-losses/gains-losses.entity-service'
import {
  CostBasisCalculationMethod,
  CreateTaxLotDto,
  CreateTaxLotSaleDto,
  GetAvailableTaxLotDto,
  TaxLotStatus
} from '../../shared/entity-services/gains-losses/interfaces'
import { TaxLotSale } from '../../shared/entity-services/gains-losses/tax-lot-sale.entity'
import { TaxLot } from '../../shared/entity-services/gains-losses/tax-lot.entity'
import { Wallet } from '../../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../../shared/helpers/date.helper'
import { LoggerService } from '../../shared/logger/logger.service'
import { WalletEventTypesEnum } from '../../wallets/events/event-types'
import { WalletSyncBalanceFromChainsEventParams } from '../../wallets/events/events'
import { SwapActivitiesGroup, WalletOwnedCryptocurrenciesBuilder } from './interface'

@Injectable()
export class AdditionalTransformationsPerWalletGroupDomainService {
  readonly BATCH_SIZE: number = 500
  readonly MAX_LIST_SIZE: number = this.BATCH_SIZE * 4

  constructor(
    private additionalTransformationPerWalletGroupTasksService: AdditionalTransformationPerWalletGroupTasksEntityService,
    private financialTransactionsService: FinancialTransactionsEntityService,
    private gainsLossesService: GainsLossesEntityService,
    private featureFlagsService: FeatureFlagsEntityService,
    private readonly walletsService: WalletsEntityService,
    private readonly logger: LoggerService,
    private eventEmitter: EventEmitter2
  ) {}

  async executeWorkflow(task: AdditionalTransformationPerWalletGroupTask) {
    if (task.metadata?.gainLossWorkflowStatus != TaskStatusEnum.COMPLETED) {
      await this.additionalTransformationPerWalletGroupTasksService.updateFirstExecutedAt(task)

      const lastProcessedChildId = await this.executeGainLossPerChildWorkflow({
        taskId: task.id,
        walletGroupId: task.walletGroupId,
        blockchainId: task.blockchainId,
        organizationId: task.organizationId,
        lastCompletedFinancialTransactionChildId: task.metadata?.lastCompletedFinancialTransactionChildId
      })

      await this.executeGainLossPerParentWorkflow({
        taskId: task.id,
        organizationId: task.organizationId,
        lastCompletedFinancialTransactionChildId: task.metadata?.lastCompletedFinancialTransactionChildId
      })

      task.metadata.gainLossWorkflowStatus = TaskStatusEnum.COMPLETED
      await this.additionalTransformationPerWalletGroupTasksService.updateMetadata(task.id, {
        ...task.metadata,
        lastCompletedFinancialTransactionChildId: lastProcessedChildId
      })
    }

    // We calculating balance based on list of tokens we have in TaxLots.
    // this is only for alerting purposes
    this.eventEmitter.emit(
      WalletEventTypesEnum.WALLET_SYNC_BALANCE_FROM_CHAINS_PER_WALLET_GROUP,
      new WalletSyncBalanceFromChainsEventParams({
        walletGroupId: task.walletGroupId,
        blockchainId: task.blockchainId
      })
    )

    await this.additionalTransformationPerWalletGroupTasksService.changeStatus(task.id, TaskStatusEnum.COMPLETED)
  }

  async executeGainLossPerChildWorkflow(params: {
    taskId: string
    walletGroupId: string
    blockchainId: string
    organizationId: string
    lastCompletedFinancialTransactionChildId: string
  }) {
    const wallets = await this.walletsService.getAllByOrganizationIdAndWalletGroupId(
      params.organizationId,
      params.walletGroupId
    )

    const walletsMapGroupedByAddress: Map<string, Wallet> = new Map<string, Wallet>()
    const addresses: string[] = []

    for (const wallet of wallets) {
      walletsMapGroupedByAddress.set(wallet.address, wallet)
      addresses.push(wallet.address)
    }

    if (!params.lastCompletedFinancialTransactionChildId) {
      const walletIds = wallets.map((wallet) => wallet.id)
      const callback = () => {
        return this.updateLastExecutedAtForTaskId(params.taskId)
      }
      await this.gainsLossesService.deleteTaxLotSaleByWalletIdAndBlockchainId(walletIds, params.blockchainId, callback)
      await this.gainsLossesService.deleteTaxLotByWalletIdAndBlockchainId(walletIds, params.blockchainId, callback)
    }

    const startingId = params.lastCompletedFinancialTransactionChildId ?? '0'
    let highestCompletedFinancialTransactionChildId = params.lastCompletedFinancialTransactionChildId ?? '0'

    let skip = 0
    let financialTransactionChildren: FinancialTransactionChild[] = []

    const walletOwnedCryptocurrenciesBuilder = new WalletOwnedCryptocurrenciesBuilder(walletsMapGroupedByAddress)

    do {
      financialTransactionChildren = await this.getFinancialTransactionChildren({
        addresses,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        skip,
        startingId
      })

      if (financialTransactionChildren.length) {
        const internalChildMap: Map<string, FinancialTransactionChild> = new Map<string, FinancialTransactionChild>()
        let wrapChildArray: FinancialTransactionChild[] = []

        for (const child of financialTransactionChildren) {
          const metadata = child.financialTransactionChildMetadata
          const completedChildren = []

          walletOwnedCryptocurrenciesBuilder.fromChild(child)
          if (metadata.gainLossInclusionStatus === GainLossInclusionStatus.ALL) {
            await this.gainLossInclusionAllWorfklow(child, walletsMapGroupedByAddress)
            completedChildren.push(child)
          } else if (metadata.gainLossInclusionStatus === GainLossInclusionStatus.INTERNAL) {
            if (
              [FinancialTransactionParentActivity.WRAP, FinancialTransactionParentActivity.UNWRAP].includes(
                child.financialTransactionParent.activity
              )
            ) {
              const oppositeChild = wrapChildArray.find((c) => c.hash === child.hash && c.id !== child.id)
              if (oppositeChild) {
                wrapChildArray = wrapChildArray.filter((c) => c.id !== oppositeChild.id)
                await this.gainLossInclusionInternalWorfklow(
                  oppositeChild,
                  child,
                  walletsMapGroupedByAddress,
                  'service_gain_loss_inclusion_internal_workflow'
                )
                completedChildren.push(oppositeChild)
                completedChildren.push(child)
              } else {
                wrapChildArray.push(child)
              }
            } else {
              const internalUniqueId = child.publicId.slice(0, 30)
              const childPair = internalChildMap.get(internalUniqueId)
              if (childPair) {
                await this.gainLossInclusionInternalWorfklow(
                  child,
                  childPair,
                  walletsMapGroupedByAddress,
                  'service_gain_loss_inclusion_internal_workflow'
                )
                completedChildren.push(child)
                completedChildren.push(childPair)
                internalChildMap.delete(internalUniqueId)
              } else {
                internalChildMap.set(internalUniqueId, child)
              }
            }
          } else {
            this.logger.error(`Unimplemented gain loss inclusion status in gainLossWorkflow for child ${child.id}`)
          }

          for (const completedChild of completedChildren) {
            await this.financialTransactionsService.updateChildIdWithStatus(
              completedChild.id,
              FinancialTransactionChildMetadataStatus.SYNCED
            )
          }

          if (new Decimal(child.id).greaterThan(highestCompletedFinancialTransactionChildId)) {
            highestCompletedFinancialTransactionChildId = child.id
          }
        }

        if (internalChildMap.size !== 0) {
          this.logger.error(`Gain loss worfklow internalChildPair is not fully consumed`, internalChildMap)
        }

        if (wrapChildArray.length !== 0) {
          this.logger.error(`Gain loss worfklow wrapChildArray is not fully consumed`, wrapChildArray)
        }

        await this.additionalTransformationPerWalletGroupTasksService.updateLastExecutedAt(params.taskId)
      }
      skip += financialTransactionChildren.length
    } while (financialTransactionChildren.length)

    const walletOwnedCryptocurrencies = walletOwnedCryptocurrenciesBuilder.build()

    for (const [walletId, walletOwnedCryptocurrency] of Object.entries(walletOwnedCryptocurrencies)) {
      if (walletOwnedCryptocurrency) {
        await this.walletsService.updateOwnedCryptocurrencies(walletId, walletOwnedCryptocurrency)
      }
    }

    return highestCompletedFinancialTransactionChildId === '0' ? null : highestCompletedFinancialTransactionChildId
  }

  private async getFinancialTransactionChildren(params: {
    addresses: string[]
    blockchainId: string
    organizationId: string
    skip: number
    startingId: string
  }) {
    const financialTransactionChildren = await this.financialTransactionsService.getChildrenByAddressesAndBlockchainId({
      addresses: params.addresses,
      blockchainId: params.blockchainId,
      organizationId: params.organizationId,
      skip: params.skip,
      take: this.BATCH_SIZE,
      startingId: params.startingId
    })

    let finalResult: FinancialTransactionChild[] = [...financialTransactionChildren]
    if (finalResult.length >= this.BATCH_SIZE) {
      // If the last valueTimestamp is the same as the first valueTimestamp, then there are more to be fetched
      const firstValueTimestamp = finalResult[0].valueTimestamp.getTime()
      let nextBatchSkip = this.BATCH_SIZE
      while (firstValueTimestamp === finalResult[finalResult.length - 1].valueTimestamp.getTime()) {
        if (finalResult.length >= this.MAX_LIST_SIZE) {
          // Less likely to happen, but just in case
          throw new Error('Too many transactions to process')
        }
        const nextBatch = await this.financialTransactionsService.getChildrenByAddressesAndBlockchainId({
          addresses: params.addresses,
          blockchainId: params.blockchainId,
          organizationId: params.organizationId,
          skip: params.skip + nextBatchSkip,
          take: this.BATCH_SIZE,
          startingId: params.startingId
        })
        nextBatchSkip += this.BATCH_SIZE
        finalResult = [...finalResult, ...nextBatch]
      }
    }

    if (finalResult.length >= this.BATCH_SIZE) {
      //trim the last hash because there might be more in the next page and they all need to be processed together
      const lastChild = finalResult.pop()
      while (finalResult.at(-1).valueTimestamp.getTime() === lastChild.valueTimestamp.getTime()) {
        finalResult.pop()
      }
    }

    return finalResult
  }

  //Only for swap for now
  async executeGainLossPerParentWorkflow(params: {
    taskId: string
    organizationId: string
    lastCompletedFinancialTransactionChildId: string
  }) {
    const startingId = params.lastCompletedFinancialTransactionChildId ?? '0'

    const financialTransactionParents = await this.financialTransactionsService.getParentsByOrganizationIdAndActivity(
      params.organizationId,
      SwapActivitiesGroup,
      startingId
    )

    for (const parent of financialTransactionParents) {
      try {
        const incomingChildMetadata = parent.financialTransactionChild.find(
          (child) =>
            child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.INCOMING
        ).financialTransactionChildMetadata
        const outgoingChildMetadata = parent.financialTransactionChild.find(
          (child) =>
            child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING &&
            child.financialTransactionChildMetadata.type !== FinancialTransactionChildMetadataType.FEE
        ).financialTransactionChildMetadata

        const swapOutgoingPrice = outgoingChildMetadata.costBasis
        const swapIncomingPrice = incomingChildMetadata.fiatAmount

        const swapGainLoss = Decimal.sub(swapIncomingPrice, swapOutgoingPrice).toString()
        await this.financialTransactionsService.updateChildMetadata(outgoingChildMetadata.id, {
          gainLoss: swapGainLoss
        })
      } catch (e) {
        this.logger.error('executeGainLossPerParentWorkflow encountered error', { params, parentId: parent.id }, e)
      }
    }
  }

  private updateLastExecutedAtForTaskId(taskId: string) {
    return this.additionalTransformationPerWalletGroupTasksService.updateLastExecutedAt(taskId)
  }

  async gainLossInclusionAllWorfklow(
    child: FinancialTransactionChild,
    walletsMapGroupedByAddress: Map<string, Wallet>
  ) {
    const metadata = child.financialTransactionChildMetadata
    const updatedBy = 'service_gain_loss_inclusion_all_workflow'
    if (metadata.direction === FinancialTransactionChildMetadataDirection.INCOMING) {
      const wallet = walletsMapGroupedByAddress.get(child.toAddress)

      const createTaxLotDto: CreateTaxLotDto = {
        financialTransactionChildId: child.id,
        cryptocurrency: child.cryptocurrency,
        blockchainId: child.blockchainId,
        amountTotal: child.cryptocurrencyAmount,
        amountAvailable: child.cryptocurrencyAmount,
        status: TaxLotStatus.AVAILABLE,
        statusReason: null,
        purchasedAt: child.valueTimestamp,
        transferredAt: child.valueTimestamp,
        costBasisAmount: child.financialTransactionChildMetadata.fiatAmount,
        costBasisPerUnit: child.financialTransactionChildMetadata.fiatAmountPerUnit,
        costBasisFiatCurrency: child.financialTransactionChildMetadata.fiatCurrency,
        walletId: wallet.id,
        organizationId: child.organizationId,
        updatedBy: 'service_gain_loss_workflow',
        previousTaxLotSaleId: null
      }

      await this.gainsLossesService.createOrUpdateTaxLot(createTaxLotDto)
    } else if (metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING) {
      const wallet = walletsMapGroupedByAddress.get(child.fromAddress)

      await this.processOutgoingChildWorkflow(child, wallet.id, updatedBy, false)
    }
  }

  async gainLossInclusionInternalWorfklow(
    firstChild: FinancialTransactionChild,
    secondChild: FinancialTransactionChild,
    walletsMapGroupedByAddress: Map<string, Wallet>,
    updatedBy: string
  ) {
    const incomingChild =
      firstChild.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.INCOMING
        ? firstChild
        : secondChild
    const outgoingChild =
      secondChild.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
        ? secondChild
        : firstChild

    if (incomingChild.id === outgoingChild.id) {
      this.logger.error(
        `Child pair has the same direction: ${firstChild.id}:${firstChild.financialTransactionChildMetadata.direction} and ${secondChild.id}:${secondChild.financialTransactionChildMetadata.direction}`
      )
      return
    }

    const outgoingWallet = walletsMapGroupedByAddress.get(outgoingChild.fromAddress)

    const taxLotSales: TaxLotSale[] = await this.processOutgoingChildWorkflow(
      outgoingChild,
      outgoingWallet.id,
      updatedBy,
      true
    )

    if (taxLotSales.length) {
      const incomingWallet = walletsMapGroupedByAddress.get(incomingChild.toAddress)
      for (const taxLotSale of taxLotSales) {
        const createTaxLotDto: CreateTaxLotDto = {
          financialTransactionChildId: incomingChild.id,
          cryptocurrency: incomingChild.cryptocurrency,
          blockchainId: incomingChild.blockchainId,
          amountTotal: taxLotSale.soldAmount,
          amountAvailable: taxLotSale.soldAmount,
          status: TaxLotStatus.AVAILABLE,
          statusReason: null,
          purchasedAt: taxLotSale.taxLot.purchasedAt,
          transferredAt: incomingChild.valueTimestamp,
          costBasisAmount: taxLotSale.costBasisAmount,
          costBasisPerUnit: taxLotSale.costBasisPerUnit,
          costBasisFiatCurrency: incomingChild.financialTransactionChildMetadata.fiatCurrency,
          walletId: incomingWallet.id,
          organizationId: incomingChild.organizationId,
          updatedBy: updatedBy,
          previousTaxLotSaleId: taxLotSale.id
        }

        await this.gainsLossesService.createOrUpdateInternalTaxLot(createTaxLotDto)
      }
    }
  }

  async processOutgoingChildWorkflow(
    child: FinancialTransactionChild,
    walletId: string,
    updatedBy: string,
    isInternal: boolean = false
  ) {
    const metadata = child.financialTransactionChildMetadata

    const getAvailableTaxLotDto: GetAvailableTaxLotDto = {
      financialTransactionChildId: child.id,
      cryptocurrency: child.cryptocurrency,
      blockchainId: child.blockchainId,
      walletId: walletId,
      organizationId: child.organizationId,
      updatedBy: updatedBy,
      amountRequested: child.cryptocurrencyAmount,
      soldAt: child.valueTimestamp,
      costBasisCalculationMethod: CostBasisCalculationMethod.FIFO
    }

    const taxLots: TaxLot[] = await this.gainsLossesService.getAvailableTaxLotsFromDto(getAvailableTaxLotDto)

    const amountRequested = new Decimal(child.cryptocurrencyAmount)
    let currentSum = new Decimal(0)
    const taxLotSales: TaxLotSale[] = []

    for (const taxLot of taxLots) {
      currentSum = Decimal.add(currentSum, taxLot.amountAvailable)

      const createTaxLotSaleDto: CreateTaxLotSaleDto = {
        taxLot: taxLot,
        soldAmount: taxLot.amountAvailable,
        soldAt: child.valueTimestamp,
        financialTransactionChildId: child.id,
        cryptocurrency: child.cryptocurrency,
        blockchainId: child.blockchainId,
        walletId: walletId,
        organizationId: child.organizationId,
        updatedBy: updatedBy
      }

      if (currentSum.greaterThanOrEqualTo(amountRequested)) {
        const originalCurrentSum = Decimal.sub(currentSum, taxLot.amountAvailable)
        const soldAmount = Decimal.sub(amountRequested, originalCurrentSum)

        createTaxLotSaleDto.soldAmount = soldAmount.toString()

        const taxLotSale = await this.gainsLossesService.createTaxLotSale(createTaxLotSaleDto)
        taxLotSales.push(taxLotSale)
        break
      } else {
        const taxLotSale = await this.gainsLossesService.createTaxLotSale(createTaxLotSaleDto)
        taxLotSales.push(taxLotSale)
      }
    }

    const isAnyTaxlotSaleWithNullCostBasis = !!taxLotSales.find((taxLotSale) => !taxLotSale.costBasisPerUnit)
    const costBasis = isAnyTaxlotSaleWithNullCostBasis
      ? null
      : taxLotSales.reduce(
          (sum, curr) => Decimal.add(sum, Decimal.mul(curr.costBasisPerUnit, curr.soldAmount)),
          new Decimal(0)
        )
    metadata.costBasis = costBasis ? costBasis.toString() : null
    metadata.costBasisUpdatedAt = dateHelper.getUTCTimestamp()
    metadata.costBasisUpdatedBy = updatedBy
    if (currentSum.comparedTo(amountRequested) < 0) {
      this.financialTransactionsService.addSubstatusToChildMetadata(
        FinancialTransactionChildMetadataSubstatus.MISSING_COST_BASIS,
        metadata
      )
    } else {
      this.financialTransactionsService.removeSubstatusFromChildMetadata(
        FinancialTransactionChildMetadataSubstatus.MISSING_COST_BASIS,
        metadata
      )
    }
    metadata.gainLoss = isInternal ? null : Decimal.sub(metadata.fiatAmount, costBasis).toString()

    await this.financialTransactionsService.updateChildMetadata(metadata.id, metadata)

    return taxLotSales
  }
}
