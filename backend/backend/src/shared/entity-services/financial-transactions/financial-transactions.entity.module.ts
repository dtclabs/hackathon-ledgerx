import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from '../../logger/logger.module'
import { ResourceAnnotationsEntityModule } from '../annotations/resource-annotations/resource-annotations.entity.module'
import { BlockchainsEntityModule } from '../blockchains/blockchains.entity.module'
import { CryptoWrappedMappingsEntityModule } from '../crypto-wrapped-mappings/crypto-wrapped-mappings.entity.module'
import { WalletsEntityModule } from '../wallets/wallets.entity.module'
import { FinancialTransactionChildMetadata } from './financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from './financial-transaction-child.entity'
import { FinancialTransactionFile } from './financial-transaction-files.entity'
import { FinancialTransactionParent } from './financial-transaction-parent.entity'
import { FinancialTransactionPreprocess } from './financial-transaction-preprocess.entity'
import { FinancialTransactionsEntityService } from './financial-transactions.entity-service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialTransactionParent,
      FinancialTransactionChild,
      FinancialTransactionChildMetadata,
      FinancialTransactionPreprocess,
      FinancialTransactionFile
    ]),
    LoggerModule,
    WalletsEntityModule,
    BlockchainsEntityModule,
    CryptoWrappedMappingsEntityModule,
    ResourceAnnotationsEntityModule
  ],
  providers: [FinancialTransactionsEntityService],
  exports: [TypeOrmModule, FinancialTransactionsEntityService]
})
export class FinancialTransactionsEntityModule {}
