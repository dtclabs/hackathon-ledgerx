import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FiatCurrenciesEntityService } from './fiat-currencies.entity-service'
import { FiatCurrency } from './fiat-currency.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FiatCurrency])],
  providers: [FiatCurrenciesEntityService],
  exports: [TypeOrmModule, FiatCurrenciesEntityService]
})
export class FiatCurrenciesEntityModule {}
