import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OptimismLogsEntityService } from './optimism-logs.entity.service'
import { OptimismTracesEntityService } from './optimism-traces.entity.service'
import { OptimismLog } from './optimism-log.entity'
import { OptimismTrace } from './optimism-trace.entity'
import { OptimismReceipt } from './optimism-receipt.entity'
import { OptimismReceiptsEntityService } from './optimism-receipts.entity.service'
import { OptimismTransactionDetail } from './optimism-transaction-detail.entity'
import { OptimismTransactionDetailsEntityService } from './optimism-transaction-details.entity.service'
import { OptimismAddressTransaction } from './optimism-address-transaction.entity'
import { OptimismAddressTransactionsEntityService } from './optimism-address-transactions.entity.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OptimismLog,
      OptimismTrace,
      OptimismReceipt,
      OptimismTransactionDetail,
      OptimismAddressTransaction
    ])
  ],
  providers: [
    OptimismLogsEntityService,
    OptimismTracesEntityService,
    OptimismReceiptsEntityService,
    OptimismTransactionDetailsEntityService,
    OptimismAddressTransactionsEntityService
  ],
  exports: [
    TypeOrmModule,
    OptimismLogsEntityService,
    OptimismTracesEntityService,
    OptimismReceiptsEntityService,
    OptimismTransactionDetailsEntityService,
    OptimismAddressTransactionsEntityService
  ]
})
export class OptimismEntityModule {}
