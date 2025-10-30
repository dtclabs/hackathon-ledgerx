import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { PricesService } from '../../prices/prices.service'
import { FinancialTransactionChildMetadata } from '../../shared/entity-services/financial-transactions/financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataType,
  GainLossInclusionStatus
} from '../../shared/entity-services/financial-transactions/interfaces'
import { GainsLossesEntityService } from '../../shared/entity-services/gains-losses/gains-losses.entity-service'
import { TaxLot } from '../../shared/entity-services/gains-losses/tax-lot.entity'
import { OrganizationSettingsEntityService } from '../../shared/entity-services/organization-settings/organization-settings.entity-service'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../../shared/helpers/date.helper'
import { ChangeFiatCurrencyForOrganizationEventParams } from './events/events'
import { SwapActivitiesGroup } from './interface'

@Injectable()
export class OperationalTransformationsDomainService {
  constructor(
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private pricesService: PricesService,
    private gainsLossesService: GainsLossesEntityService,
    private walletsService: WalletsEntityService
  ) {}

  // swap/wrap/unwrap parent
  // incoming
  // update tax lot price
  // outgoing (gainloss = incoming.fiatAmount - outgoing.costbasis)
  // update gainloss

  // general incoming child
  // update tax lot price (the recursive step)
  // update tax lot sale price
  // update outgoing child costbasis
  // update outgoing gainloss
  // update tax lot for internal transfer (this is recursive)
  // general outgoing child
  // update gainloss

  // update gainloss flow
  // get selling price
  // if swap/wrap/unwrap
  // cost basis of the incoming leg
  // if not
  // fiat amount / price of the unit on that day
  // get buying price (cost basis from tax lot sales)
  // gainloss = selling - buying

  // internal transfer
  // incoming
  // No need to do anything (the other transaction would have recursively resolved this)
  // outgoing
  // No need to do anything (the other transaction would have recursively resolved this)
  async executeRecalculatePriceForParentIdWorkflow(parentId: string) {
    const parent = await this.financialTransactionsEntityService.getParentById(parentId, {
      financialTransactionChild: { financialTransactionChildMetadata: true }
    })

    const updatedBy = 'service_recalculate_price_for_parent'

    if (SwapActivitiesGroup.includes(parent.activity)) {
      const incomingChild = parent.financialTransactionChild.find(
        (child) =>
          child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.INCOMING
      )

      await this.recalculatePriceForIncoming(incomingChild, updatedBy)

      const outgoingChild = parent.financialTransactionChild.find(
        (child) =>
          child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING &&
          child.financialTransactionChildMetadata.type !== FinancialTransactionChildMetadataType.FEE
      )

      const costBasis = await this.gainsLossesService.getCostBasisByChildId(outgoingChild.id)

      // update gainloss of outgoing
      const manualGainLoss = Decimal.sub(
        incomingChild.financialTransactionChildMetadata.fiatAmount,
        costBasis
      ).toString()
      await this.recalculateGainLossForOutgoingChild(outgoingChild.id, updatedBy, manualGainLoss)

      const feeChild = parent.financialTransactionChild.find(
        (child) => child.financialTransactionChildMetadata.type === FinancialTransactionChildMetadataType.FEE
      )

      if (feeChild) {
        await this.recalculateGainLossForOutgoingChild(feeChild.id, updatedBy)
      }
    } else {
      const outgoingChildren = parent.financialTransactionChild.filter(
        (child) =>
          child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
      )

      for (const child of outgoingChildren) {
        await this.recalculateGainLossForOutgoingChild(child.id, updatedBy)
      }

      const incomingChildren = parent.financialTransactionChild.filter(
        (child) =>
          child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.INCOMING
      )

      for (const child of incomingChildren) {
        await this.recalculatePriceForIncoming(child, updatedBy)
      }
    }
  }

  async recalculatePriceForIncoming(child: FinancialTransactionChild, updatedBy: string) {
    const metadata = child.financialTransactionChildMetadata
    const taxLots = await this.gainsLossesService.getTaxLotsByChildId(child.id, { taxLotSales: true })

    for (const taxLot of taxLots) {
      let newPricePerUnit = metadata.fiatAmountPerUnit

      if (metadata.gainLossInclusionStatus === GainLossInclusionStatus.INTERNAL) {
        const taxLotSale = await this.gainsLossesService.getTaxLotSaleById(taxLot.previousTaxLotSaleId)
        newPricePerUnit = taxLotSale.costBasisPerUnit
      }

      await this.updateTaxLotRecursive(taxLot, new Decimal(newPricePerUnit), metadata.fiatCurrency, updatedBy)
    }
  }

  private async updateTaxLotRecursive(
    taxLot: TaxLot,
    newPricePerUnit: Decimal,
    fiatCurrency: string,
    updatedBy: string
  ) {
    const isFiatCurrencyChanged = taxLot.costBasisFiatCurrency !== fiatCurrency
    const isCostBaseChanged = taxLot.costBasisPerUnit !== newPricePerUnit.toString()
    if (isFiatCurrencyChanged || isCostBaseChanged) {
      const taxLotSales = await this.gainsLossesService.updateTaxLotAndSalesForPriceUpdate({
        taxLot,
        pricePerUnit: newPricePerUnit,
        updatedBy,
        fiatCurrency
      })

      if (taxLotSales.length) {
        const childIds = [...new Set(taxLotSales.map((sale) => sale.financialTransactionChildId))]

        for (const childId of childIds) {
          const costBasis = await this.gainsLossesService.getCostBasisByChildId(childId)
          const updatedChildMetadata: Partial<FinancialTransactionChildMetadata> = {}

          updatedChildMetadata.costBasis = costBasis.toString()
          updatedChildMetadata.costBasisUpdatedAt = dateHelper.getUTCTimestamp()
          updatedChildMetadata.costBasisUpdatedBy = updatedBy

          await this.financialTransactionsEntityService.updateChildMetadataByChildId(childId, updatedChildMetadata)
          await this.recalculateGainLossForOutgoingChild(childId, updatedBy)
        }
      }

      if (taxLotSales.length) {
        const saleIds = taxLotSales.map((sale) => sale.id)

        for (const saleId of saleIds) {
          const taxLotPerTaxLotSaleList = await this.gainsLossesService.getTaxLotsByPreviousSaleId(saleId, {
            taxLotSales: true
          })

          for (const taxLot of taxLotPerTaxLotSaleList) {
            await this.updateTaxLotRecursive(taxLot, newPricePerUnit, fiatCurrency, updatedBy)
          }
        }
      }
    }
  }

  private async recalculateGainLossForOutgoingChild(childId: string, updatedBy: string, manualGainLoss?: string) {
    const updateData: Partial<FinancialTransactionChildMetadata> = {}

    if (manualGainLoss) {
      updateData.gainLoss = manualGainLoss
    } else {
      const child = await this.financialTransactionsEntityService.getChildById(childId, {
        financialTransactionParent: { financialTransactionChild: { financialTransactionChildMetadata: true } },
        financialTransactionChildMetadata: true
      })

      const metadata = child.financialTransactionChildMetadata
      const parent = child.financialTransactionParent

      let updatedCostBasis: Decimal = null

      if (
        metadata.type !== FinancialTransactionChildMetadataType.FEE &&
        SwapActivitiesGroup.includes(parent.activity)
      ) {
        const incomingChild = parent.financialTransactionChild.find(
          (child) =>
            child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.INCOMING
        )

        const outgoingChild = parent.financialTransactionChild.find(
          (child) =>
            child.financialTransactionChildMetadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING &&
            child.financialTransactionChildMetadata.type !== FinancialTransactionChildMetadataType.FEE
        )

        updatedCostBasis = await this.gainsLossesService.getCostBasisByChildId(outgoingChild.id)

        updateData.gainLoss = Decimal.sub(
          incomingChild.financialTransactionChildMetadata.fiatAmount,
          updatedCostBasis
        ).toString()
      } else {
        updatedCostBasis = await this.gainsLossesService.getCostBasisByChildId(childId)

        updateData.gainLoss =
          metadata.gainLossInclusionStatus === GainLossInclusionStatus.INTERNAL
            ? null
            : Decimal.sub(metadata.fiatAmount, updatedCostBasis).toString()
      }

      if (updatedCostBasis && updatedCostBasis.toString() !== metadata.costBasis) {
        updateData.costBasis = updatedCostBasis.toString()
        updateData.costBasisUpdatedAt = dateHelper.getUTCTimestamp()
        updateData.costBasisUpdatedBy = updatedBy
      }
    }

    return this.financialTransactionsEntityService.updateChildMetadataByChildId(childId, updateData)
  }

  async executeChangeFiatCurrencyForOrganizationWorkflow(params: ChangeFiatCurrencyForOrganizationEventParams) {
    const fiatCurrency = params.fiatCurrencyAlphabeticCode
    const updatedBy = 'service_change_fiat_currency_for_organization'

    let skip = 0
    let batchSize = 500
    const parentIdSet: Set<string> = new Set<string>()
    let financialTransactionChildren: FinancialTransactionChild[] = []

    do {
      financialTransactionChildren = await this.financialTransactionsEntityService.getAllChildrenFromOrganization(
        params.organizationId,
        skip,
        batchSize,
        {
          financialTransactionChildMetadata: true,
          cryptocurrency: true,
          financialTransactionParent: true
        }
      )

      if (financialTransactionChildren.length) {
        for (const child of financialTransactionChildren) {
          const metadata = child.financialTransactionChildMetadata
          let newPricePerUnit = await this.pricesService.getFiatPriceByCryptocurrency(
            child.cryptocurrency,
            fiatCurrency,
            child.valueTimestamp
          )

          let updatedByUserPreviously = null
          //TODO: Unify this magic string in a common module
          if (
            metadata.fiatAmountUpdatedBy.startsWith('account_') ||
            metadata.fiatAmountPerUnitUpdatedBy.startsWith('account_')
          ) {
            const prevFiatCurrencyPrice = await this.pricesService.getFiatPriceByCryptocurrency(
              child.cryptocurrency,
              metadata.fiatCurrency,
              child.valueTimestamp
            )

            newPricePerUnit = Decimal.div(metadata.fiatAmountPerUnit, prevFiatCurrencyPrice).mul(newPricePerUnit)
            updatedByUserPreviously = metadata.fiatAmountUpdatedBy.startsWith('account_')
              ? metadata.fiatAmountUpdatedBy
              : metadata.fiatAmountPerUnitUpdatedBy
          }

          const updatedMetadata =
            await this.financialTransactionsEntityService.generatePartialChildMetadataForPriceUpdate({
              cryptocurrencyAmount: child.cryptocurrencyAmount,
              pricePerUnit: newPricePerUnit,
              fiatCurrency,
              updatedBy: updatedByUserPreviously ?? updatedBy
            })

          await this.financialTransactionsEntityService.updateChildMetadata(metadata.id, updatedMetadata)

          parentIdSet.add(child.financialTransactionParent.id)
        }
      }

      skip += batchSize
    } while (financialTransactionChildren.length === batchSize)

    if (parentIdSet.size) {
      for (const parentId of parentIdSet) {
        await this.executeRecalculatePriceForParentIdWorkflow(parentId)
      }
    }
  }
}
