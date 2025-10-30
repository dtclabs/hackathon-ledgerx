import Decimal from 'decimal.js'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { TaxLot } from '../shared/entity-services/gains-losses/tax-lot.entity'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { BalanceDto } from './interfaces'
import { BalanceGroupByFieldEnum, BalanceGroupType } from './types'

export class BalanceDtoBuilder {
  taxLots: TaxLot[] = []
  cryptocurrencyTaxLotsMap: Map<
    string,
    {
      cryptocurrency: Cryptocurrency
      currentFiatPrice: Decimal
    }
  > = new Map()

  constructor(private readonly wallets: Wallet[]) {
    return this
  }

  doesCurrencyPriceExist(cryptocurrency: Cryptocurrency): boolean {
    return !!this.cryptocurrencyTaxLotsMap.get(cryptocurrency.id)?.currentFiatPrice
  }

  addTaxLot(taxLot: TaxLot) {
    this.taxLots.push(taxLot)
    return this
  }

  addCurrentFiatPrice(cryptocurrency: Cryptocurrency, currentFiatPrice: Decimal) {
    const cryptocurrencyTaxLots = this.cryptocurrencyTaxLotsMap.get(cryptocurrency.id)
    if (cryptocurrencyTaxLots) {
      cryptocurrencyTaxLots.currentFiatPrice = currentFiatPrice
    } else {
      this.cryptocurrencyTaxLotsMap.set(cryptocurrency.id, {
        cryptocurrency,
        currentFiatPrice
      })
    }
    return this
  }

  build(
    defaultFiatCurrency: string,
    groupBy?: BalanceGroupByFieldEnum,
    secondGroupBy?: BalanceGroupByFieldEnum
  ): BalanceDto {
    if (secondGroupBy && !groupBy) {
      throw new Error('Group by is mandatory when second group by is present')
    }

    return this.getBalanceGroupType(
      this.taxLots,
      [groupBy, secondGroupBy].filter((x) => !!x),
      defaultFiatCurrency
    )
  }

  getBalanceGroupType(taxLots: TaxLot[], groupBy: BalanceGroupByFieldEnum[], defaultFiatCurrency: string): BalanceDto {
    // Handle empty tax lots array
    if (!taxLots || taxLots.length === 0) {
      return {
        value: '0',
        fiatCurrency: defaultFiatCurrency,
        ...(groupBy.length > 0 ? { groups: {} } : {})
      }
    }
    
    const total = this.getFiatValue(taxLots)
    const fiatCurrency = taxLots.at(0)?.costBasisFiatCurrency ?? defaultFiatCurrency
    if (groupBy.length === 0) {
      return {
        value: total.toString(),
        fiatCurrency
      }
    }
    const firstGroupBy = groupBy[0]
    const nextGroupBy = groupBy.slice(1)

    const taxLotsMap = this.groupTaxLotsBy(taxLots, firstGroupBy)
    const balanceGroupType: BalanceGroupType = {}
    for (const [entityId, groupedTaxLots] of taxLotsMap.entries()) {
      balanceGroupType[entityId] = this.getBalanceGroupType(groupedTaxLots, nextGroupBy, defaultFiatCurrency)
    }

    return {
      value: total.toString(),
      fiatCurrency,
      groups: balanceGroupType
    }
  }

  groupTaxLotsBy(originalTaxLots: TaxLot[], groupBy: BalanceGroupByFieldEnum): Map<string, TaxLot[]> {
    const taxLotsMap = new Map<string, TaxLot[]>()
    for (const taxLot of originalTaxLots) {
      const groupByValue = this.getGroupByValue(taxLot, groupBy)
      const taxLots = taxLotsMap.get(groupByValue) || []
      taxLots.push(taxLot)
      taxLotsMap.set(groupByValue, taxLots)
    }
    return taxLotsMap
  }

  getFiatValue(taxLots: TaxLot[]): Decimal {
    let total = new Decimal(0)
    for (const taxLot of taxLots) {
      const cryptocurrencyTaxLots = this.cryptocurrencyTaxLotsMap.get(taxLot.cryptocurrency.id)
      if (!cryptocurrencyTaxLots) {
        throw new Error(`Cryptocurrency not found for id: ${taxLot.cryptocurrency.id}`)
      }
      
      // Defensive programming: handle undefined amountAvailable
      const amountAvailable = taxLot.amountAvailable ?? '0'
      if (amountAvailable === undefined || amountAvailable === null || amountAvailable === '') {
        console.warn(`Warning: amountAvailable is invalid for tax lot ${taxLot.id}, skipping`)
        continue
      }
      
      // Also check currentFiatPrice
      const currentFiatPrice = cryptocurrencyTaxLots.currentFiatPrice
      if (currentFiatPrice === undefined || currentFiatPrice === null) {
        console.warn(`Warning: currentFiatPrice is invalid for cryptocurrency ${taxLot.cryptocurrency.id}, using 0`)
        continue
      }
      
      try {
        const taxLotFiatValue = new Decimal(amountAvailable).times(currentFiatPrice)
        total = total.plus(taxLotFiatValue)
      } catch (error) {
        console.error(`Error calculating fiat value for tax lot ${taxLot.id}:`, error)
        console.error(`amountAvailable: ${amountAvailable}, currentFiatPrice: ${currentFiatPrice}`)
        // Skip this tax lot but continue with others
        continue
      }
    }
    return total
  }

  private getGroupByValue(taxLot: TaxLot, groupBy: BalanceGroupByFieldEnum) {
    switch (groupBy) {
      case BalanceGroupByFieldEnum.WALLET_ID: {
        const wallet = this.wallets.find((wallet) => wallet.id === taxLot.walletId)
        return wallet.publicId
      }
      case BalanceGroupByFieldEnum.BLOCKCHAIN_ID:
        return taxLot.blockchainId
      default:
        throw new Error('Not supported')
    }
  }
}
