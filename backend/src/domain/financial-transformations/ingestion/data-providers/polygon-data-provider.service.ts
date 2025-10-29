import { Injectable } from '@nestjs/common'
import { EvmBlockReward } from '../../../../shared/entity-services/ingestion/evm/evm-block-reward.entity'
import {
  EvmBlockRewardCreateParams,
  EvmGetBlockRewardParams,
  EvmTransactionEntitiesGetByBatchesParams
} from '../../../../shared/entity-services/ingestion/evm/interfaces'
import { PolygonAddressTransactionsEntityService } from '../../../../shared/entity-services/ingestion/evm/polygon/polygon-address-transactions.entity.service'
import { PolygonBlockReward } from '../../../../shared/entity-services/ingestion/evm/polygon/polygon-block-reward.entity'
import { PolygonBlockRewardEntityService } from '../../../../shared/entity-services/ingestion/evm/polygon/polygon-block-reward.entity.service'
import { PolygonLogsEntityService } from '../../../../shared/entity-services/ingestion/evm/polygon/polygon-logs.entity.service'
import { PolygonReceiptsEntityService } from '../../../../shared/entity-services/ingestion/evm/polygon/polygon-receipts.entity.service'
import { PolygonTracesEntityService } from '../../../../shared/entity-services/ingestion/evm/polygon/polygon-traces.entity.service'
import { PolygonTransactionDetailsEntityService } from '../../../../shared/entity-services/ingestion/evm/polygon/polygon-transaction-details.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { EvmscanDataProviderBase } from './evmscan-data-provider.base'

@Injectable()
export class PolygonDataProviderService extends EvmscanDataProviderBase {
  constructor(
    protected readonly logger: LoggerService,
    private readonly polygonAddressTransactionsEntityService: PolygonAddressTransactionsEntityService,
    private readonly polygonReceiptsEntityService: PolygonReceiptsEntityService,
    private readonly polygonLogsEntityService: PolygonLogsEntityService,
    private readonly polygonTracesEntityService: PolygonTracesEntityService,
    private readonly polygonTransactionDetailsEntityService: PolygonTransactionDetailsEntityService,
    private readonly polygonBlockRewardEntityService: PolygonBlockRewardEntityService
  ) {
    super(
      logger,
      polygonAddressTransactionsEntityService,
      polygonReceiptsEntityService,
      polygonLogsEntityService,
      polygonTracesEntityService,
      polygonTransactionDetailsEntityService
    )
  }

  getLatestBlockNumberFromBlockReward(params: EvmGetBlockRewardParams): Promise<number> {
    return this.polygonBlockRewardEntityService.getLatestBlockNumber(params)
  }

  async saveBlockReward(params: EvmBlockRewardCreateParams): Promise<void> {
    const polygonBlockReward = PolygonBlockReward.createBlockReward(params)
    await this.polygonBlockRewardEntityService.upsert(polygonBlockReward)
  }

  getBlockRewards(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmBlockReward[]> {
    return this.polygonBlockRewardEntityService.getByBatches(params)
  }
}
