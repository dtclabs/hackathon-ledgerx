import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoingeckoModule } from '../../../coingecko/coingecko.module'
import { FilesModule } from '../../../files/files.module'
import { CryptocurrenciesEntityService } from './cryptocurrencies.entity-service'
import { CryptocurrencyAddress } from './cryptocurrency-address.entity'
import { Cryptocurrency } from './cryptocurrency.entity'
import { LoggerModule } from '../../logger/logger.module'
import { FeatureFlagsEntityModule } from '../feature-flags/feature-flags.entity.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Cryptocurrency, CryptocurrencyAddress]),
    FilesModule,
    FeatureFlagsEntityModule,
    HttpModule,
    CoingeckoModule,
    LoggerModule
  ],
  providers: [CryptocurrenciesEntityService],
  exports: [TypeOrmModule, CryptocurrenciesEntityService]
})
export class CryptocurrenciesEntityModule {}
