import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GainsLossesEntityService } from './gains-losses.entity-service'
import { TaxLotSale } from './tax-lot-sale.entity'
import { TaxLot } from './tax-lot.entity'
import { LoggerModule } from '../../logger/logger.module'

@Module({
  imports: [TypeOrmModule.forFeature([TaxLot, TaxLotSale]), LoggerModule],
  providers: [GainsLossesEntityService],
  exports: [TypeOrmModule, GainsLossesEntityService]
})
export class GainsLossesEntityModule {}
