import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BscLogsEntityService } from './bsc-logs.entity.service'
import { BscTracesEntityService } from './bsc-traces.entity.service'
import { BscLog } from './bsc-log.entity'
import { BscTrace } from './bsc-trace.entity'
import { BscReceipt } from './bsc-receipt.entity'
import { BscReceiptsEntityService } from './bsc-receipts.entity.service'
import { BscTransactionDetail } from './bsc-transaction-detail.entity'
import { BscTransactionDetailsEntityService } from './bsc-transaction-details.entity.service'
import { BscAddressTransaction } from './bsc-address-transaction.entity'
import { BscAddressTransactionsEntityService } from './bsc-address-transactions.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([BscLog, BscTrace, BscReceipt, BscTransactionDetail, BscAddressTransaction])],
  providers: [
    BscLogsEntityService,
    BscTracesEntityService,
    BscReceiptsEntityService,
    BscTransactionDetailsEntityService,
    BscAddressTransactionsEntityService
  ],
  exports: [
    TypeOrmModule,
    BscLogsEntityService,
    BscTracesEntityService,
    BscReceiptsEntityService,
    BscTransactionDetailsEntityService,
    BscAddressTransactionsEntityService
  ]
})
export class BscEntityModule {}
