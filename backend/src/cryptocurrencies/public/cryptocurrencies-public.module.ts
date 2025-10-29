import { Module } from '@nestjs/common'
import { CryptocurrenciesEntityModule } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { CryptocurrenciesPublicController } from './cryptocurrencies-public.controller'
import { LoggerModule } from '../../shared/logger/logger.module'

@Module({
  imports: [CryptocurrenciesEntityModule, LoggerModule],
  controllers: [CryptocurrenciesPublicController],
  providers: [],
  exports: []
})
export class CryptocurrenciesPublicModule {}
