import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GnosisLogsEntityService } from './gnosis-logs.entity.service'
import { GnosisTracesEntityService } from './gnosis-traces.entity.service'
import { GnosisLog } from './gnosis-log.entity'
import { GnosisTrace } from './gnosis-trace.entity'
import { GnosisReceipt } from './gnosis-receipt.entity'
import { GnosisReceiptsEntityService } from './gnosis-receipts.entity.service'
import { GnosisTransactionDetail } from './gnosis-transaction-detail.entity'
import { GnosisTransactionDetailsEntityService } from './gnosis-transaction-details.entity.service'
import { GnosisAddressTransaction } from './gnosis-address-transaction.entity'
import { GnosisAddressTransactionsEntityService } from './gnosis-address-transactions.entity.service'
import { GnosisCustomLogsEntityService } from './gnosis-custom-logs.entity.service'
import { GnosisCustomLog } from './gnosis-custom-log.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GnosisLog,
      GnosisTrace,
      GnosisReceipt,
      GnosisTransactionDetail,
      GnosisAddressTransaction,
      GnosisCustomLog
    ])
  ],
  providers: [
    GnosisLogsEntityService,
    GnosisTracesEntityService,
    GnosisReceiptsEntityService,
    GnosisTransactionDetailsEntityService,
    GnosisAddressTransactionsEntityService,
    GnosisCustomLogsEntityService
  ],
  exports: [
    TypeOrmModule,
    GnosisLogsEntityService,
    GnosisTracesEntityService,
    GnosisReceiptsEntityService,
    GnosisTransactionDetailsEntityService,
    GnosisAddressTransactionsEntityService,
    GnosisCustomLogsEntityService
  ]
})
export class GnosisEntityModule {}
