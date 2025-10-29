import { Injectable } from '@nestjs/common'
import { OrganizationsEntityService } from '../../../../shared/entity-services/organizations/organizations.entity-service'
import {
  CellValueType,
  ExportColumn,
  ExportColumnWidthEnum,
  ExportWorkflowBaseCommand,
  UrlLink
} from '../export-workflow.base.command'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { ExportWorkflowsEntityService } from '../../../../shared/entity-services/export-workflows/export-workflows.entity.service'
import { ExportWorkflow } from '../../../../shared/entity-services/export-workflows/export-workflow.entity'
import { FilesService } from '../../../../files/files.service'
import {
  ExportWorkflowFileType,
  ExportWorkflowType,
  SpotBalanceExportWorkflowMetadata,
  SpotBalanceInterval
} from '../../../../shared/entity-services/export-workflows/interface'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { GainsLossesEntityService } from '../../../../shared/entity-services/gains-losses/gains-losses.entity-service'
import { WalletsEntityService } from '../../../../shared/entity-services/wallets/wallets.entity-service'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Wallet } from '../../../../shared/entity-services/wallets/wallet.entity'
import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { TaxLot } from '../../../../shared/entity-services/gains-losses/tax-lot.entity'
import { TaxLotSale } from '../../../../shared/entity-services/gains-losses/tax-lot-sale.entity'
import Decimal from 'decimal.js'
import { PricesService } from '../../../../prices/prices.service'
import { BlockchainsEntityService } from '../../../../shared/entity-services/blockchains/blockchains.entity-service'
import { getBlockExplorerUrlToAddress } from '../../../../shared/utils/utils'
import { endOfDay, startOfMonth, subDays } from 'date-fns'
import { Blockchain } from '../../../../shared/entity-services/blockchains/blockchain.entity'
import { SpotBalancePdfBuilder } from './spot-balance-template.pdf.builder'

@Injectable()
export class SpotBalanceExportWorkflowCommand extends ExportWorkflowBaseCommand<SpotBalanceExportWorkflowData> {
  constructor(
    protected logger: LoggerService,
    protected exportWorkflowsEntityService: ExportWorkflowsEntityService,
    protected filesService: FilesService,
    protected organizationsEntityService: OrganizationsEntityService,
    protected gainsLossesService: GainsLossesEntityService,
    protected walletsService: WalletsEntityService,
    protected cryptocurrenciesService: CryptocurrenciesEntityService,
    protected pricesService: PricesService,
    protected blockchainsEntityService: BlockchainsEntityService
  ) {
    super(logger, exportWorkflowsEntityService, filesService, organizationsEntityService)
  }

  protected async collectData(workflow: ExportWorkflow): Promise<SpotBalanceExportWorkflowData[]> {
    if (workflow.type !== ExportWorkflowType.SPOT_BALANCE) {
      throw new Error(`Wrong type for Export workflow ${workflow.id}`)
    }
    const metadata = workflow.privateMetadata as SpotBalanceExportWorkflowMetadata

    if (!metadata?.query?.startDate) {
      throw new Error(`Missing startTime for workflow ${workflow.id}`)
    }
    if (!metadata?.query?.endDate) {
      throw new Error(`Missing endTime for workflow ${workflow.id}`)
    }
    if (!metadata?.query?.interval) {
      throw new Error(`Missing interval for workflow ${workflow.id}`)
    }

    const startDate = new Date(metadata.query.startDate)
    const dateIntervals: Date[] = this.splitDateRangeByIntervals({
      startDate,
      endDate: new Date(metadata.query.endDate),
      interval: metadata.query.interval
    })

    const endDate = dateIntervals[dateIntervals.length - 1]
    if (!endDate) {
      throw new Error(`Invalid date range for workflow ${workflow.id}`)
    }

    let wallets: Wallet[] = []
    if (metadata.query.walletIds?.length) {
      wallets = await this.walletsService.getByIds(metadata.query.walletIds)
    }

    let cryptocurrencies: Cryptocurrency[] = []
    if (metadata.query.cryptocurrencyIds?.length) {
      cryptocurrencies = await this.cryptocurrenciesService.getAllByIds(metadata.query.cryptocurrencyIds)
    }

    const walletIds = wallets.map((wallet) => wallet.id)
    const cryptocurrencyIds = cryptocurrencies.map((cryptocurrency) => cryptocurrency.id)

    const taxLots = await this.gainsLossesService.getTaxLotsUntilDate({
      organizationId: workflow.organizationId,
      untilDate: endDate,
      walletIds: walletIds,
      cryptocurrencyIds: cryptocurrencyIds,
      blockchainIds: metadata.query.blockchainIds
    })

    const taxLotSales = await this.gainsLossesService.getTaxLotSalesUntilDate({
      organizationId: workflow.organizationId,
      untilDate: endDate,
      walletIds: walletIds,
      cryptocurrencyIds: cryptocurrencyIds,
      blockchainIds: metadata.query.blockchainIds
    })

    const spotBalanceResults: SpotBalanceExportWorkflowData[] = []

    for (let i = 0; i < dateIntervals.length; i++) {
      const closingDate = dateIntervals[i]

      // Getting all tax lots and tax lot sales for active at the intervalDate
      // TODO: The next step in refactoring is to adjust our approach: instead of retrieving all tax lots and tax lot sales
      //  from the genesis time, we can use the previous interval date as a start time. Then, we can use the calculated values
      //  from this to determine the values for the current interval date.
      const taxLotsGroups = this.getRelevantTaxLotsGroupsForDate(taxLots, taxLotSales, closingDate)

      for (const taxLotGroup of taxLotsGroups) {
        const totalAvailableAmounts = this.calculateTotalAvailableAmountWithCostBasisFromTaxLots(
          taxLotGroup.taxLots,
          taxLotGroup.taxLotSales
        )
        const fiatCurrency = taxLotGroup.taxLots[0].costBasisFiatCurrency
        const cryptocurrency = await this.cryptocurrenciesService.get(taxLotGroup.cryptocurrencyId)
        const fiatPriceAtClosingPeriod = await this.pricesService.getFiatPriceByCryptocurrency(
          cryptocurrency,
          fiatCurrency,
          closingDate
        )

        let previousIntervalResult: SpotBalanceExportWorkflowData | null = null
        if (i > 0) {
          const previousInterval = dateIntervals[i - 1]
          previousIntervalResult = spotBalanceResults.find((item) => {
            return (
              item.cryptocurrencyId === taxLotGroup.cryptocurrencyId &&
              item.walletId === taxLotGroup.walletId &&
              item.blockchainId === taxLotGroup.blockchainId &&
              item.date.getTime() === previousInterval.getTime()
            )
          })
        } else {
          previousIntervalResult = null
        }

        const fiatBalanceForClosingPrice = totalAvailableAmounts.cryptocurrencyAmount.mul(fiatPriceAtClosingPeriod)
        const unrealizedGLAtCostBasis = fiatBalanceForClosingPrice.sub(totalAvailableAmounts.costBasis)

        let fiatPriceAtOpeningPeriod: Decimal = new Decimal(0)
        let unrealizedGLDelta: Decimal = new Decimal(0)
        let unrealizedGLAtClosingPeriod: Decimal = new Decimal(0)
        let fiatBalanceForOpeningPrice: Decimal = new Decimal(0)

        if (previousIntervalResult) {
          fiatPriceAtOpeningPeriod = previousIntervalResult.fiatPriceAtClosingPeriod
        } else if (i === 0) {
          const openingDate = this.getFirstOpeningDate({ date: startDate, interval: metadata.query.interval })
          fiatPriceAtOpeningPeriod = await this.pricesService.getFiatPriceByCryptocurrency(
            cryptocurrency,
            fiatCurrency,
            openingDate
          )
        }

        const isNonZeroAmount = !totalAvailableAmounts.cryptocurrencyAmount.eq(0)
        if (fiatPriceAtOpeningPeriod && isNonZeroAmount) {
          fiatBalanceForOpeningPrice = totalAvailableAmounts.cryptocurrencyAmount.mul(fiatPriceAtOpeningPeriod)
          unrealizedGLDelta = fiatBalanceForOpeningPrice.isZero()
            ? new Decimal(0)
            : fiatBalanceForClosingPrice.div(fiatBalanceForOpeningPrice).sub(1)
          unrealizedGLAtClosingPeriod = fiatPriceAtClosingPeriod
            .sub(fiatPriceAtOpeningPeriod)
            .mul(totalAvailableAmounts.cryptocurrencyAmount)
        }

        spotBalanceResults.push({
          date: closingDate,
          cryptocurrencyId: taxLotGroup.cryptocurrencyId,
          walletId: taxLotGroup.walletId,
          blockchainId: taxLotGroup.blockchainId,
          assetAmount: totalAvailableAmounts.cryptocurrencyAmount,
          fiatCurrency: fiatCurrency,
          unrealizedGLAtCostBasis: unrealizedGLAtCostBasis,
          unrealizedGLAtClosingPeriod: unrealizedGLAtClosingPeriod,
          fiatPriceAtClosingPeriod: fiatPriceAtClosingPeriod,
          fiatPriceAtOpeningPeriod: fiatPriceAtOpeningPeriod,
          totalCostBasis: totalAvailableAmounts.costBasis,
          fiatBalanceForOpeningPrice: fiatBalanceForOpeningPrice,
          fiatBalanceForClosingPrice: fiatBalanceForClosingPrice,
          unrealizedGLDelta: unrealizedGLDelta.toNumber()
        })
      }
    }

    return spotBalanceResults
  }

  private getRelevantTaxLotsGroupsForDate(taxLots: TaxLot[], taxLotSales: TaxLotSale[], date: Date): TaxLotsGroup[] {
    const taxLotsMap: Map<string, TaxLotsGroup> = new Map()

    const taxLotsForInterval = taxLots.filter((taxLot) => {
      return taxLot.transferredAt.getTime() <= date.getTime()
    })
    for (const taxLot of taxLotsForInterval) {
      const key = `${taxLot.cryptocurrency.id}-${taxLot.walletId}-${taxLot.blockchainId}`
      if (!taxLotsMap.has(key)) {
        taxLotsMap.set(key, {
          cryptocurrencyId: taxLot.cryptocurrency.id,
          walletId: taxLot.walletId,
          blockchainId: taxLot.blockchainId,
          taxLots: [],
          taxLotSales: []
        })
      }
      taxLotsMap.get(key).taxLots.push(taxLot)
    }

    const taxLotSalesForInterval = taxLotSales.filter((taxLotSale) => {
      return taxLotSale.soldAt.getTime() <= date.getTime()
    })
    for (const taxLotSale of taxLotSalesForInterval) {
      const key = `${taxLotSale.cryptocurrency.id}-${taxLotSale.walletId}-${taxLotSale.blockchainId}`
      if (!taxLotsMap.has(key)) {
        taxLotsMap.set(key, {
          cryptocurrencyId: taxLotSale.cryptocurrency.id,
          walletId: taxLotSale.walletId,
          blockchainId: taxLotSale.blockchainId,
          taxLots: [],
          taxLotSales: []
        })
      }
      taxLotsMap.get(key).taxLotSales.push(taxLotSale)
    }
    return Array.from(taxLotsMap.values())
  }

  protected async transformDataToFileExport(
    workflow: ExportWorkflow,
    data: SpotBalanceExportWorkflowData[]
  ): Promise<string> {
    const cryptocurrencyIdsSet = new Set(data.map((item) => item.cryptocurrencyId))
    const cryptocurrencies = await this.cryptocurrenciesService.getAllByIds(Array.from(cryptocurrencyIdsSet), {
      addresses: true
    })
    const blockchains = await this.blockchainsEntityService.getEnabledBlockchains()
    const wallets = await this.walletsService.getAllByOrganizationId(workflow.organizationId)

    const formattedDataForExport = this.formatDataForExport({ data, cryptocurrencies, blockchains, wallets, workflow })

    switch (workflow.fileType) {
      case ExportWorkflowFileType.CSV: {
        return this.generateCsvContent(formattedDataForExport)
      }
      case ExportWorkflowFileType.PDF: {
        return this.generatePdfContent({
          ...formattedDataForExport,
          metadata: workflow.privateMetadata as SpotBalanceExportWorkflowMetadata
        })
      }
      default: {
        throw new Error(`Unknown fileType for exportWorkflow ${workflow.id}`)
      }
    }
  }

  private generateCsvContent(params: { columns: ExportColumn[]; rows: CellValueType[][] }): string {
    const columns = params.columns.map((column) => column.name)
    const rows = params.rows.map((row) => {
      return row.map((cell) => {
        return this.getValueForCsvCell(cell, params.columns[row.indexOf(cell)])
      })
    })

    return this.generateCSV({
      headers: columns,
      csvData: rows
    })
  }

  private generatePdfContent(params: {
    columns: ExportColumn[]
    rows: CellValueType[][]
    metadata: SpotBalanceExportWorkflowMetadata
  }): string {
    const pdfBuilder = new SpotBalancePdfBuilder()
    const columns = params.columns.map((column) => ({
      name: column.name,
      width: this.getPdfWidths(column.width)
    }))
    pdfBuilder
      .addTitle(params.metadata.query.interval)
      .addDatePeriod(new Date(params.metadata.query.startDate), new Date(params.metadata.query.endDate))
      .addColumns(columns)

    const rows = params.rows.map((row) => {
      return row.map((cell) => {
        return this.getValueForPdfCell(cell, params.columns[row.indexOf(cell)])
      })
    })

    const html = pdfBuilder.addRows(rows).addLogo(this.filesService.getURLToHqLogo()).build()
    return html
  }

  private splitDateRangeByIntervals(params: { endDate: Date; interval: SpotBalanceInterval; startDate: Date }): Date[] {
    switch (params.interval) {
      case SpotBalanceInterval.MONTHLY: {
        return dateHelper.getEndOfMonthsInRangeOrNow(params.startDate, params.endDate)
      }
      default: {
        throw new Error(`Unknown interval or doesn't supported ${params.interval}`)
      }
    }
  }

  private getFirstOpeningDate(params: { date: Date; interval: SpotBalanceInterval }): Date {
    switch (params.interval) {
      case SpotBalanceInterval.MONTHLY: {
        return endOfDay(subDays(startOfMonth(params.date), 1))
      }
      default: {
        throw new Error(`Unknown interval or doesn't supported ${params.interval}`)
      }
    }
  }

  private calculateTotalAvailableAmountWithCostBasisFromTaxLots(
    taxLots: TaxLot[],
    taxLotSales: TaxLotSale[]
  ): TotalAvailableAmountWithCostBasis {
    const totalAvailableAmountWithCostBasis: TotalAvailableAmountWithCostBasis = {
      cryptocurrencyAmount: new Decimal(0),
      costBasis: new Decimal(0)
    }
    const totalSold = taxLotSales.reduce((acc, taxLotSale) => {
      return acc.add(taxLotSale.soldAmount)
    }, new Decimal(0))

    let availableAmount = new Decimal(totalSold)
    for (const taxLot of taxLots) {
      if (availableAmount.gt(0)) {
        availableAmount = availableAmount.sub(taxLot.amountTotal)

        if (availableAmount.lessThan(0)) {
          totalAvailableAmountWithCostBasis.cryptocurrencyAmount =
            totalAvailableAmountWithCostBasis.cryptocurrencyAmount.add(availableAmount.abs())
          totalAvailableAmountWithCostBasis.costBasis = totalAvailableAmountWithCostBasis.costBasis.add(
            Decimal.mul(availableAmount.abs(), taxLot.costBasisPerUnit)
          )
          availableAmount = new Decimal(0)
        }

        if (availableAmount.eq(0)) {
          continue
        }
      }

      if (availableAmount.eq(0)) {
        totalAvailableAmountWithCostBasis.cryptocurrencyAmount =
          totalAvailableAmountWithCostBasis.cryptocurrencyAmount.add(taxLot.amountTotal)
        totalAvailableAmountWithCostBasis.costBasis = totalAvailableAmountWithCostBasis.costBasis.add(
          taxLot.costBasisAmount
        )
      }
    }
    return totalAvailableAmountWithCostBasis
  }

  private formatDataForExport(params: {
    data: SpotBalanceExportWorkflowData[]
    workflow: ExportWorkflow
    blockchains: Blockchain[]
    wallets: Wallet[]
    cryptocurrencies: Cryptocurrency[]
  }) {
    const columns: ExportColumn[] = [
      new ExportColumn({ name: 'Date', width: ExportColumnWidthEnum.md }),
      new ExportColumn({ name: 'Asset', width: ExportColumnWidthEnum.md }),
      new ExportColumn({ name: 'Wallet' }),
      new ExportColumn({ name: 'Blockchain', width: ExportColumnWidthEnum.md }),
      new ExportColumn({ name: 'Fiat currency', width: ExportColumnWidthEnum.sm }),
      new ExportColumn({ name: 'Asset Amount', decimalPlaces: 4 }),
      new ExportColumn({ name: 'Asset FMV at Opening Period', width: ExportColumnWidthEnum.lg, decimalPlaces: 2 }),
      new ExportColumn({ name: 'Fiat Balance at Opening Price', width: ExportColumnWidthEnum.lg, decimalPlaces: 2 }),
      new ExportColumn({ name: 'Asset FMV at Closing Period', width: ExportColumnWidthEnum.lg, decimalPlaces: 2 }),
      new ExportColumn({ name: 'Fiat Balance at Closing Price', width: ExportColumnWidthEnum.lg, decimalPlaces: 2 }),
      new ExportColumn({ name: 'Delta, %', width: ExportColumnWidthEnum.sm }),
      new ExportColumn({ name: 'Total Cost Basis', width: ExportColumnWidthEnum.lg, decimalPlaces: 2 }),
      new ExportColumn({ name: 'Unrealized G/L at Cost Basis', width: ExportColumnWidthEnum.md, decimalPlaces: 2 }),
      new ExportColumn({
        name: 'Unrealized G/L at Closing Period',
        width: ExportColumnWidthEnum.md,
        decimalPlaces: 2
      })
    ]

    const rows: CellValueType[][] = params.data.map((item) => {
      const blockchain = params.blockchains.find((blockchain) => blockchain.publicId === item.blockchainId)
      const wallet = params.wallets.find((wallet) => wallet.id === item.walletId)
      const walletUrl = getBlockExplorerUrlToAddress(blockchain, wallet.address)
      const cryptocurrency = params.cryptocurrencies.find(
        (cryptocurrency) => cryptocurrency.id === item.cryptocurrencyId
      )
      const tokenAddress = cryptocurrency.addresses.find((a) => a.blockchainId === item.blockchainId)?.address
      const tokenUrl = getBlockExplorerUrlToAddress(blockchain, tokenAddress)

      return [
        dateHelper.getDateComponentFromDateTimestamp(item.date),
        new UrlLink(cryptocurrency.symbol, tokenUrl),
        new UrlLink(wallet.name, walletUrl),
        item.blockchainId,
        item.fiatCurrency,
        item.assetAmount,
        item.fiatPriceAtOpeningPeriod,
        item.fiatBalanceForOpeningPrice,
        item.fiatPriceAtClosingPeriod,
        item.fiatBalanceForClosingPrice,
        new Decimal(item.unrealizedGLDelta * 100).toDecimalPlaces(2).toString(),
        item.totalCostBasis,
        item.unrealizedGLAtCostBasis,
        item.unrealizedGLAtClosingPeriod
      ]
    })

    return {
      columns,
      rows
    }
  }
}

export interface SpotBalanceExportWorkflowData {
  date: Date
  cryptocurrencyId: string
  walletId: string
  blockchainId: string
  assetAmount: Decimal
  fiatPriceAtOpeningPeriod: Decimal
  fiatPriceAtClosingPeriod: Decimal
  fiatCurrency: string
  totalCostBasis: Decimal
  unrealizedGLAtCostBasis: Decimal
  unrealizedGLAtClosingPeriod: Decimal
  fiatBalanceForOpeningPrice: Decimal
  fiatBalanceForClosingPrice: Decimal
  unrealizedGLDelta: number
}

export interface TotalAvailableAmountWithCostBasis {
  cryptocurrencyAmount: Decimal
  costBasis: Decimal
}

export interface TaxLotsGroup {
  cryptocurrencyId: string
  walletId: string
  blockchainId: string
  taxLots: TaxLot[]
  taxLotSales: TaxLotSale[]
}
