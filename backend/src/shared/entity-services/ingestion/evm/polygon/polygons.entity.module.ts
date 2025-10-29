import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PolygonLogsEntityService } from './polygon-logs.entity.service'
import { PolygonTracesEntityService } from './polygon-traces.entity.service'
import { PolygonLog } from './polygon-log.entity'
import { PolygonTrace } from './polygon-trace.entity'
import { PolygonReceipt } from './polygon-receipt.entity'
import { PolygonReceiptsEntityService } from './polygon-receipts.entity.service'
import { PolygonTransactionDetail } from './polygon-transaction-detail.entity'
import { PolygonTransactionDetailsEntityService } from './polygon-transaction-details.entity.service'
import { PolygonAddressTransaction } from './polygon-address-transaction.entity'
import { PolygonAddressTransactionsEntityService } from './polygon-address-transactions.entity.service'
import { PolygonBlockRewardEntityService } from './polygon-block-reward.entity.service'
import { PolygonBlockReward } from './polygon-block-reward.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PolygonLog,
      PolygonTrace,
      PolygonReceipt,
      PolygonTransactionDetail,
      PolygonAddressTransaction,
      PolygonBlockReward
    ])
  ],
  providers: [
    PolygonLogsEntityService,
    PolygonTracesEntityService,
    PolygonReceiptsEntityService,
    PolygonTransactionDetailsEntityService,
    PolygonAddressTransactionsEntityService,
    PolygonBlockRewardEntityService
  ],
  exports: [
    TypeOrmModule,
    PolygonLogsEntityService,
    PolygonTracesEntityService,
    PolygonReceiptsEntityService,
    PolygonTransactionDetailsEntityService,
    PolygonAddressTransactionsEntityService,
    PolygonBlockRewardEntityService
  ]
})
export class PolygonsEntityModule {}
