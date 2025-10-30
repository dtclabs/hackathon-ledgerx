import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { WalletContractConfigurationLogsEntityService } from '../../../../shared/entity-services/wallet-contract-configuration-logs/wallet-contract-configuration-logs.entity.service'
import { EvmDataProviderService } from './interfaces'
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
import { EvmAddressTransaction } from '../../../../shared/entity-services/ingestion/evm/evm-address-transaction.entity'
import { EvmReceipt } from '../../../../shared/entity-services/ingestion/evm/evm-receipt.entity'
import { EvmTrace } from '../../../../shared/entity-services/ingestion/evm/evm-trace.entity'
import { EvmLog } from '../../../../shared/entity-services/ingestion/evm/evm-log.entity'
import { EvmBlockReward } from '../../../../shared/entity-services/ingestion/evm/evm-block-reward.entity'

@Injectable()
export class EthereumDataProviderService implements EvmDataProviderService {
  constructor(
    private readonly logger: LoggerService,
    private readonly walletContractConfigurationLogsEntityService: WalletContractConfigurationLogsEntityService
  ) {}

  async getLatestBlockNumber(params: {
    address: string
    blockchainId: string
    contractConfigurationId: string
  }): Promise<number> {
    return await this.walletContractConfigurationLogsEntityService.getLatestBlock({
      address: params.address,
      contractConfigurationId: params.contractConfigurationId
    })
  }

  async getLatestBlockNumberFromAll(params: {
    address: string
    blockchainId: string
    contractConfigurationId: string
  }): Promise<number> {
    throw new Error('Method not implemented.')
  }

  completeAddressTransaction(addressTransactionId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  countTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<number> {
    throw new Error('Method not implemented.')
  }

  getIncompleteAddressTransactions(params: EvmAddressTransactionGetByBatchParams): Promise<EvmAddressTransaction[]> {
    throw new Error('Method not implemented.')
  }

  getTransactionLogs(params: EvmTransactionEntitiesGetParams): Promise<EvmLog[]> {
    throw new Error('Method not implemented.')
  }

  getTransactionReceipt(params: EvmTransactionEntitiesGetParams): Promise<EvmReceipt> {
    throw new Error('Method not implemented.')
  }

  getTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<EvmTrace[]> {
    throw new Error('Method not implemented.')
  }

  saveAddressTransaction(params: EvmAddressTransactionCreateParams): Promise<void> {
    throw new Error('Method not implemented.')
  }

  saveTransactionReceipt(params: EvmReceiptCreateParams): Promise<EvmReceipt> {
    throw new Error('Method not implemented.')
  }

  saveTransactionTrace(params: EvmTraceCreateParams): Promise<void> {
    throw new Error('Method not implemented.')
  }

  saveTransactionLog(params: EvmLogCreateParams): Promise<EvmLog> {
    throw new Error('Method not implemented.')
  }

  saveTransactionDetails(params: EvmTransactionDetailCreateParams): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getTransactionHashes(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmGetTransactionHashesResult[]> {
    throw new Error('Method not implemented.')
  }

  getContractAddresses(params: EvmGetContractAddressesFromLogsParams): Promise<string[]> {
    throw new Error('Method not implemented.')
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
