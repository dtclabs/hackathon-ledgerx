import { EvmAddressTransaction } from '../../../../shared/entity-services/ingestion/evm/evm-address-transaction.entity'
import { EvmBlockReward } from '../../../../shared/entity-services/ingestion/evm/evm-block-reward.entity'
import { EvmLog } from '../../../../shared/entity-services/ingestion/evm/evm-log.entity'
import { EvmReceipt } from '../../../../shared/entity-services/ingestion/evm/evm-receipt.entity'
import { EvmTrace } from '../../../../shared/entity-services/ingestion/evm/evm-trace.entity'
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

export interface EvmDataProviderService {
  getLatestBlockNumber(params: {
    address: string
    blockchainId: string
    contractConfigurationId: string
  }): Promise<number>

  //TODO: What is this for?
  getLatestBlockNumberFromAll(params: {
    address: string
    blockchainId: string
    contractConfigurationId: string
  }): Promise<number>

  saveAddressTransaction(params: EvmAddressTransactionCreateParams): Promise<void>

  completeAddressTransaction(addressTransactionId: string): Promise<void>

  getIncompleteAddressTransactions(params: EvmAddressTransactionGetByBatchParams): Promise<EvmAddressTransaction[]>

  getTransactionReceipt(params: EvmTransactionEntitiesGetParams): Promise<EvmReceipt>

  saveTransactionReceipt(params: EvmReceiptCreateParams): Promise<EvmReceipt>

  saveTransactionLog(params: EvmLogCreateParams): Promise<EvmLog>

  getTransactionLogs(params: EvmTransactionEntitiesGetParams): Promise<EvmLog[]>

  getTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<EvmTrace[]>

  countTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<number>

  saveTransactionTrace(params: EvmTraceCreateParams): Promise<void>

  saveTransactionDetails(params: EvmTransactionDetailCreateParams): Promise<void>

  getTransactionHashes(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmGetTransactionHashesResult[]>

  getContractAddresses(params: EvmGetContractAddressesFromLogsParams): Promise<string[]>

  getLatestBlockNumberFromBlockReward(param: EvmGetBlockRewardParams): Promise<number>

  saveBlockReward(param: EvmBlockRewardCreateParams): Promise<void>

  getBlockRewards(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmBlockReward[]>
}
