import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { EvmscanDataProviderBase } from './evmscan-data-provider.base'
import { OptimismAddressTransactionsEntityService } from '../../../../shared/entity-services/ingestion/evm/optimism/optimism-address-transactions.entity.service'
import { OptimismReceiptsEntityService } from '../../../../shared/entity-services/ingestion/evm/optimism/optimism-receipts.entity.service'
import { OptimismLogsEntityService } from '../../../../shared/entity-services/ingestion/evm/optimism/optimism-logs.entity.service'
import { OptimismTracesEntityService } from '../../../../shared/entity-services/ingestion/evm/optimism/optimism-traces.entity.service'
import { OptimismTransactionDetailsEntityService } from '../../../../shared/entity-services/ingestion/evm/optimism/optimism-transaction-details.entity.service'
import { EvmReceiptCreateParams } from '../../../../shared/entity-services/ingestion/evm/interfaces'
import { OptimismReceipt } from '../../../../shared/entity-services/ingestion/evm/optimism/optimism-receipt.entity'
import { OptimismEtherscanReceipt } from '../../../block-explorers/etherscan/interfaces'

@Injectable()
export class OptimismDataProviderService extends EvmscanDataProviderBase {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly optimismAddressTransactionsEntityService: OptimismAddressTransactionsEntityService,
    protected readonly optimismReceiptsEntityService: OptimismReceiptsEntityService,
    protected readonly optimismLogsEntityService: OptimismLogsEntityService,
    protected readonly optimismTracesEntityService: OptimismTracesEntityService,
    protected readonly optimismTransactionDetailsEntityService: OptimismTransactionDetailsEntityService
  ) {
    super(
      logger,
      optimismAddressTransactionsEntityService,
      optimismReceiptsEntityService,
      optimismLogsEntityService,
      optimismTracesEntityService,
      optimismTransactionDetailsEntityService
    )
  }

  async saveTransactionReceipt(params: EvmReceiptCreateParams) {
    const rawReceipt = params.raw.receipt as OptimismEtherscanReceipt
    const receipt = OptimismReceipt.create({
      ...params,
      l1Fee: rawReceipt.l1Fee,
      l1FeeScalar: rawReceipt.l1FeeScalar,
      l1GasPrice: rawReceipt.l1GasPrice,
      l1GasUsed: rawReceipt.l1GasUsed
    })
    await this.optimismReceiptsEntityService.upsert(receipt)
  }
}
