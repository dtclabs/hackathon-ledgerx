import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ArbitrumAddressTransaction } from './arbitrum-address-transaction.entity'
import { ArbitrumAddressTransactionsEntityService } from './arbitrum-address-transactions.entity.service'
import { ArbitrumLog } from './arbitrum-log.entity'
import { ArbitrumLogsEntityService } from './arbitrum-logs.entity.service'
import { ArbitrumReceipt } from './arbitrum-receipt.entity'
import { ArbitrumReceiptsEntityService } from './arbitrum-receipts.entity.service'
import { ArbitrumTrace } from './arbitrum-trace.entity'
import { ArbitrumTracesEntityService } from './arbitrum-traces.entity.service'
import { ArbitrumTransactionDetail } from './arbitrum-transaction-detail.entity'
import { ArbitrumTransactionDetailsEntityService } from './arbitrum-transaction-details.entity.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArbitrumLog,
      ArbitrumTrace,
      ArbitrumReceipt,
      ArbitrumTransactionDetail,
      ArbitrumAddressTransaction
    ])
  ],
  providers: [
    ArbitrumLogsEntityService,
    ArbitrumTracesEntityService,
    ArbitrumReceiptsEntityService,
    ArbitrumTransactionDetailsEntityService,
    ArbitrumAddressTransactionsEntityService
  ],
  exports: [
    TypeOrmModule,
    ArbitrumLogsEntityService,
    ArbitrumTracesEntityService,
    ArbitrumReceiptsEntityService,
    ArbitrumTransactionDetailsEntityService,
    ArbitrumAddressTransactionsEntityService
  ]
})
export class ArbitrumEntityModule {}
