import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CoingeckoModule } from '../coingecko/coingecko.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { FiatCurrenciesEntityModule } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity.module'
import { PricesEntityModule } from '../shared/entity-services/prices/prices.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { PricesController } from './prices.controller'
import { PricesService } from './prices.service'

@Module({
  imports: [
    PricesEntityModule,
    CryptocurrenciesEntityModule,
    FiatCurrenciesEntityModule,
    CoingeckoModule,
    LoggerModule,
    HttpModule,
    ConfigModule
  ],
  providers: [PricesService],
  controllers: [PricesController],
  exports: [PricesService]
})
export class PricesModule {}
