import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TempTransactionsEntityService } from './temp-transactions.entity-service'
import { TempTransactionsEntity } from './temp-transactions.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TempTransactionsEntity])],
  controllers: [],
  providers: [TempTransactionsEntityService],
  exports: [TypeOrmModule, TempTransactionsEntityService]
})
export class TempTransactionsEntityModule {}
