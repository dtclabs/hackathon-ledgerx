import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payout } from './payout.entity'
import { PayoutsEntityService } from './payouts.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Payout])],
  controllers: [],
  providers: [PayoutsEntityService],
  exports: [PayoutsEntityService]
})
export class PayoutsEntityModule {}
