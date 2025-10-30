import { EvmAddressTransaction } from '../../../../shared/entity-services/ingestion/evm/evm-address-transaction.entity'
import { EvmAddressTransactionsEntityService } from '../../../../shared/entity-services/ingestion/evm/evm-address-transactions.entity.service'
import { EvmBlockReward } from '../../../../shared/entity-services/ingestion/evm/evm-block-reward.entity'
import { EvmLog } from '../../../../shared/entity-services/ingestion/evm/evm-log.entity'
import { EvmLogsEntityService } from '../../../../shared/entity-services/ingestion/evm/evm-logs.entity.service'
import { EvmReceipt } from '../../../../shared/entity-services/ingestion/evm/evm-receipt.entity'
import { EvmReceiptsEntityService } from '../../../../shared/entity-services/ingestion/evm/evm-receipts.entity.service'
import { EvmTrace } from '../../../../shared/entity-services/ingestion/evm/evm-trace.entity'
import { EvmTracesEntityService } from '../../../../shared/entity-services/ingestion/evm/evm-traces.entity.service'
import { EvmTransactionDetail } from '../../../../shared/entity-services/ingestion/evm/evm-transaction-detail.entity'
import { EvmTransactionDetailsEntityService } from '../../../../shared/entity-services/ingestion/evm/evm-transaction-details.entity.service'
import {
  EvmAddressTransactionCreateParams,
  EvmAddressTransactionGetByBatchParams,
  EvmBlockRewardCreateParams,
  EvmGetBlockRewardParams,
  EvmGetContractAddressesFromLogsParams,
  EvmGetTransactionHashesResult,
  EvmLogCreateParams,
  EvmReceiptCreateParams,
  EvmTraceCreateParams,
  EvmTransactionDetailCreateParams,
  EvmTransactionEntitiesGetByBatchesParams,
  EvmTransactionEntitiesGetParams
} from '../../../../shared/entity-services/ingestion/evm/interfaces'
import { LoggerService } from '../../../../shared/logger/logger.service'

export abstract class EvmscanDataProviderBase {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly evmAddressTransactionsEntityService: EvmAddressTransactionsEntityService<EvmAddressTransaction>,
    protected readonly evmReceiptsEntityService: EvmReceiptsEntityService<EvmReceipt>,
    protected readonly evmLogsEntityService: EvmLogsEntityService<EvmLog>,
    protected readonly evmTracesEntityService: EvmTracesEntityService<EvmTrace>,
    protected readonly evmTransactionDetailsEntityService: EvmTransactionDetailsEntityService<EvmTransactionDetail>
  ) {}

  getLatestBlockNumber(params: {
    address: string
    blockchainId: string
    contractConfigurationId: string
  }): Promise<number> {
    return this.evmAddressTransactionsEntityService.getLatestBlock({
      address: params.address,
      blockchainId: params.blockchainId,
      contractConfigurationId: params.contractConfigurationId
    })
  }

  getLatestBlockNumberFromAll(params: {
    address: string
    blockchainId: string
    contractConfigurationId: string
  }): Promise<number> {
    return this.evmAddressTransactionsEntityService.getLatestBlockNumberFromAll({
      address: params.address,
      blockchainId: params.blockchainId,
      contractConfigurationId: params.contractConfigurationId
    })
  }

  saveAddressTransaction(params: EvmAddressTransactionCreateParams): Promise<void> {
    const addressTransaction = EvmAddressTransaction.create(params)
    return this.evmAddressTransactionsEntityService.upsert(addressTransaction)
  }

  async completeAddressTransaction(addressTransactionId: string): Promise<void> {
    await this.evmAddressTransactionsEntityService.complete(addressTransactionId)
  }

  getIncompleteAddressTransactions(param: EvmAddressTransactionGetByBatchParams): Promise<EvmAddressTransaction[]> {
    return this.evmAddressTransactionsEntityService.findRunningByParams(param)
  }

  getTransactionReceipt(param: EvmTransactionEntitiesGetParams): Promise<EvmReceipt> {
    return this.evmReceiptsEntityService.getByTransactionHashAndBlockchain(param)
  }

  async saveTransactionReceipt(params: EvmReceiptCreateParams) {
    const receipt = EvmReceipt.create(params)
    await this.evmReceiptsEntityService.upsert(receipt)
  }

  async saveTransactionLog(params: EvmLogCreateParams) {
    const log = EvmLog.create(params)
    await this.evmLogsEntityService.upsert(log)
  }

  getTransactionLogs(params: EvmTransactionEntitiesGetParams): Promise<EvmLog[]> {
    return this.evmLogsEntityService.getByHash(params)
  }

  getTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<EvmTrace[]> {
    return this.evmTracesEntityService.getByHash(params)
  }

  countTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<number> {
    return this.evmTracesEntityService.countByHash(params)
  }

  async saveTransactionTrace(params: EvmTraceCreateParams): Promise<void> {
    const trace = EvmTrace.create(params)
    await this.evmTracesEntityService.upsert(trace)
  }

  async saveTransactionDetails(params: EvmTransactionDetailCreateParams): Promise<void> {
    const transactionDetail = EvmTransactionDetail.create(params)
    await this.evmTransactionDetailsEntityService.upsert(transactionDetail)
  }

  getTransactionHashes(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmGetTransactionHashesResult[]> {
    return this.evmAddressTransactionsEntityService.getHashesByBatches(params)
  }

  getContractAddresses(params: EvmGetContractAddressesFromLogsParams): Promise<string[]> {
    return this.evmLogsEntityService.getContractAddresses(params)
  }

  getLatestBlockNumberFromBlockReward(param: EvmGetBlockRewardParams): Promise<number> {
    throw new Error('Method not implemented.')
  }

  saveBlockReward(param: EvmBlockRewardCreateParams): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getBlockRewards(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmBlockReward[]> {
    throw new Error('Method not implemented.')
  }
}
