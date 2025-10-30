import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from '../../logger/logger.module'
import { WalletsEntityModule } from '../wallets/wallets.entity.module'
import { SolFinancialTransactionChildMetadata } from './sol-financial-transaction-child-metadata.entity'
import { SolFinancialTransactionChild } from './sol-financial-transaction-child.entity'
import { SolFinancialTransactionParent } from './sol-financial-transaction-parent.entity'
import { SolFinancialTransactionsEntityService } from './sol-financial-transactions.entity-service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolFinancialTransactionParent,
      SolFinancialTransactionChild,
      SolFinancialTransactionChildMetadata
    ]),
    LoggerModule,
    WalletsEntityModule
  ],
  providers: [SolFinancialTransactionsEntityService],
  exports: [TypeOrmModule, SolFinancialTransactionsEntityService]
})
export class SolFinancialTransactionsEntityModule {}