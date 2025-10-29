import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BillingHistory } from './billing-history.entity'
import { BillingHistoriesEntityService } from './billing-histories.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([BillingHistory])],
  controllers: [],
  providers: [BillingHistoriesEntityService],
  exports: [BillingHistoriesEntityService]
})
export class BillingHistoriesEntityModule {}
