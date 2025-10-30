import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PendingTransactionsEntityService } from './pending-transactions.entity-service'
import { PendingTransaction } from './pending-transaction.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PendingTransaction])],
  controllers: [],
  providers: [PendingTransactionsEntityService],
  exports: [TypeOrmModule, PendingTransactionsEntityService]
})
export class PendingTransactionsEntityModule {}
