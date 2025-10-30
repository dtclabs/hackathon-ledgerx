import { BadRequestException, Injectable } from '@nestjs/common'
import { subDays } from 'date-fns'
import Decimal from 'decimal.js'
import { CoingeckoDomainService } from '../coingecko/coingecko.domain.service'
import { PostgresErrorCode, currencies } from '../shared/constants'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { FiatCurrenciesEntityService } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity-service'
import { PricesEntityService } from '../shared/entity-services/prices/prices.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'

@Injectable()
export class PricesService {
  constructor(
    private pricesRepository: PricesEntityService,
    private coingeckoService: CoingeckoDomainService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private fiatCurrenciesEntityService: FiatCurrenciesEntityService,
    private logger: LoggerService
  ) {}

  async getFiatPriceByCryptocurrency(
    cryptocurrency: Cryptocurrency,
    fiatCurrency: string,
    date: Date
  ): Promise<Decimal> {
    const savedPrice = await this.pricesRepository.getByCryptoAndFiatAndDate({
      cryptocurrencyId: cryptocurrency.id,
      fiatCurrency: fiatCurrency,
      dateComponent: dateHelper.getDateComponentFromDateTimestamp(date)
    })

    if (savedPrice) {
      return new Decimal(savedPrice.price)
    } else {
      let coingeckoPriceMap = await this.coingeckoService.getHistoryPriceGroupedByFiatSymbol(
        cryptocurrency.coingeckoId,
        date
      )

      const coingeckoFormattedCurrency = fiatCurrency.toLowerCase()
      if (coingeckoPriceMap && Object.keys(coingeckoPriceMap).length && coingeckoPriceMap[coingeckoFormattedCurrency]) {
        const coingeckoPrice = new Decimal(coingeckoPriceMap[coingeckoFormattedCurrency])
        const priceEntity = await this.upsertPriceEntry(cryptocurrency, fiatCurrency, coingeckoPrice.toNumber(), date)
        return new Decimal(priceEntity.price)
      } else if (dateHelper.isToday(date)) {
        // Coingecko note: The last completed UTC day (00:00) is available 35 minutes after midnight on the next UTC day (00:35).
        // So when it is not available then we take the price of the previous day
        const yesterdayDate = subDays(date, 1)
        return await this.getFiatPriceByCryptocurrency(cryptocurrency, fiatCurrency, yesterdayDate)
      }
    }

    return new Decimal(0)
  }

  async getCurrentFiatPriceByCryptocurrency(cryptocurrency: Cryptocurrency, currency: string): Promise<Decimal> {
    return this.getFiatPriceByCryptocurrency(cryptocurrency, currency, dateHelper.getUTCTimestamp())
  }

  async getFiatPriceByPublicIds(params: {
    cryptocurrencyPublicId: string
    fiatCurrencyAlphabeticCode: string
    date: Date
  }) {
    const cryptocurrency = await this.cryptocurrenciesService.getByPublicId(params.cryptocurrencyPublicId)
    if (!cryptocurrency) throw new BadRequestException('Cryptocurrency id does not exist')

    const fiatCurrency = await this.fiatCurrenciesEntityService.getByAlphabeticCode(params.fiatCurrencyAlphabeticCode)
    if (!fiatCurrency) throw new BadRequestException('Fiat currency does not exist')

    const fiatPriceInDecimal = await this.getFiatPriceByCryptocurrency(
      cryptocurrency,
      fiatCurrency.alphabeticCode,
      params.date
    )

    return fiatPriceInDecimal ? fiatPriceInDecimal.toString() : null
  }

  async upsertPriceEntry(cryptocurrency: Cryptocurrency, fiatCurrency: string, price: number, queryDate: Date) {
    try {
      const priceEntity = await this.pricesRepository.upsertByCryptoAndFiatAndDate({
        cryptocurrency,
        fiatCurrency,
        price,
        dateComponent: dateHelper.getDateComponentFromDateTimestamp(queryDate)
      })

      return priceEntity
    } catch (error) {
      if (
        error?.code === PostgresErrorCode.UniqueViolation ||
        error?.data?.code === PostgresErrorCode.UniqueViolation
      ) {
        const priceEntity = await this.pricesRepository.getByCryptoAndFiatAndDate({
          cryptocurrencyId: cryptocurrency.id,
          fiatCurrency,
          dateComponent: dateHelper.getDateComponentFromDateTimestamp(queryDate)
        })

        return priceEntity
      }

      this.logger.error(
        `Price service createOrUpdate with cryptocurrencyId: ${cryptocurrency.id}, currency: ${fiatCurrency}, price: ${price}, date: ${queryDate} has error: ${error}`
      )
    }
  }

  async syncLastCompletedDay(): Promise<{ [cryptocurrency: string]: { [currency: string]: number } } | null> {
    let cryptocurrencies = await this.cryptocurrenciesService.getAll()
    const lastCompletedDay = dateHelper.getUTCTimestampHoursAgo(24)
    const cryptocurrencyMap: { [cryptocurrency: string]: { [currency: string]: number } } = {}

    for (const cryptocurrency of cryptocurrencies) {
      try {
        cryptocurrencyMap[cryptocurrency.name] = await this.triggerUpdatePriceForCryptocurrency(
          cryptocurrency,
          lastCompletedDay
        )
      } catch (error) {
        this.logger.error(`syncLastCompletedDay failed for date ${lastCompletedDay}`, error, {
          lastCompletedDay,
          cryptocurrency
        })
      }
    }

    return cryptocurrencyMap
  }

  private async triggerUpdatePriceForCryptocurrency(
    cryptocurrency: Cryptocurrency,
    queryDate: Date
  ): Promise<{ [key: string]: number } | null> {
    const todayDate = dateHelper.getUTCTimestamp()

    if (queryDate <= todayDate) {
      let currentPriceMap = await this.coingeckoService.getHistoryPriceGroupedByFiatSymbol(
        cryptocurrency.coingeckoId,
        queryDate
      )

      // Coingecko note: The last completed UTC day (00:00) is available 35 minutes after midnight on the next UTC day (00:35).
      // So when it is not available then we take the price of the previous day
      if (!currentPriceMap) {
        currentPriceMap = await this.coingeckoService.getHistoryPriceGroupedByFiatSymbol(
          cryptocurrency.coingeckoId,
          subDays(queryDate, 1)
        )
      }

      if (currentPriceMap) {
        for (const currency of currencies) {
          try {
            await this.upsertPriceEntry(cryptocurrency, currency, currentPriceMap[currency], queryDate)
          } catch (e) {
            this.logger.error(`Can not update price for ${cryptocurrency.coingeckoId} with currency ${currency}`, e, {
              date: queryDate
            })
          }
        }
      }

      return currentPriceMap || null
    }

    return null
  }
}
