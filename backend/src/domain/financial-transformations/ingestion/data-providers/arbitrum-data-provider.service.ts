import { Injectable } from '@nestjs/common'
import { ArbitrumAddressTransactionsEntityService } from '../../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-address-transactions.entity.service'
import { ArbitrumLogsEntityService } from '../../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-logs.entity.service'
import { ArbitrumReceipt } from '../../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-receipt.entity'
import { ArbitrumReceiptsEntityService } from '../../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-receipts.entity.service'
import { ArbitrumTracesEntityService } from '../../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-traces.entity.service'
import { ArbitrumTransactionDetailsEntityService } from '../../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-transaction-details.entity.service'
import { EvmReceiptCreateParams } from '../../../../shared/entity-services/ingestion/evm/interfaces'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { EvmscanDataProviderBase } from './evmscan-data-provider.base'

@Injectable()
export class ArbitrumDataProviderService extends EvmscanDataProviderBase {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly arbitrumAddressTransactionsEntityService: ArbitrumAddressTransactionsEntityService,
    protected readonly arbitrumReceiptsEntityService: ArbitrumReceiptsEntityService,
    protected readonly arbitrumLogsEntityService: ArbitrumLogsEntityService,
    protected readonly arbitrumTracesEntityService: ArbitrumTracesEntityService,
    protected readonly arbitrumTransactionDetailsEntityService: ArbitrumTransactionDetailsEntityService
  ) {
    super(
      logger,
      arbitrumAddressTransactionsEntityService,
      arbitrumReceiptsEntityService,
      arbitrumLogsEntityService,
      arbitrumTracesEntityService,
      arbitrumTransactionDetailsEntityService
    )
  }

  async saveTransactionReceipt(params: EvmReceiptCreateParams) {
    const receipt = ArbitrumReceipt.create(params)
    await this.arbitrumReceiptsEntityService.upsert(receipt)
  }
}
