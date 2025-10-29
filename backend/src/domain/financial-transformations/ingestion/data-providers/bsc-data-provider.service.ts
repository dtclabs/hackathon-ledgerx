import { Injectable } from '@nestjs/common'
import { BscAddressTransactionsEntityService } from '../../../../shared/entity-services/ingestion/evm/bsc/bsc-address-transactions.entity.service'
import { BscLogsEntityService } from '../../../../shared/entity-services/ingestion/evm/bsc/bsc-logs.entity.service'
import { BscReceiptsEntityService } from '../../../../shared/entity-services/ingestion/evm/bsc/bsc-receipts.entity.service'
import { BscTracesEntityService } from '../../../../shared/entity-services/ingestion/evm/bsc/bsc-traces.entity.service'
import { BscTransactionDetailsEntityService } from '../../../../shared/entity-services/ingestion/evm/bsc/bsc-transaction-details.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { EvmscanDataProviderBase } from './evmscan-data-provider.base'

@Injectable()
export class BscDataProviderService extends EvmscanDataProviderBase {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly bscAddressTransactionsEntityService: BscAddressTransactionsEntityService,
    protected readonly bscReceiptsEntityService: BscReceiptsEntityService,
    protected readonly bscLogsEntityService: BscLogsEntityService,
    protected readonly bscTracesEntityService: BscTracesEntityService,
    protected readonly bscTransactionDetailsEntityService: BscTransactionDetailsEntityService
  ) {
    super(
      logger,
      bscAddressTransactionsEntityService,
      bscReceiptsEntityService,
      bscLogsEntityService,
      bscTracesEntityService,
      bscTransactionDetailsEntityService
    )
  }

  // async getLatestBlockNumber(params: {
  //   address: string
  //   blockchainId: string
  //   contractConfigurationId: string
  // }): Promise<number> {
  //   return await this.bscAddressTransactionsEntityService.getLatestBlock({
  //     address: params.address,
  //     blockchainId: params.blockchainId,
  //     contractConfigurationId: params.contractConfigurationId
  //   })
  // }

  // async getLatestBlockNumberFromAll(params: {
  //   address: string
  //   blockchainId: string
  //   contractConfigurationId: string
  // }): Promise<number> {
  //   return await this.bscAddressTransactionsEntityService.getLatestBlockNumberFromAll({
  //     address: params.address,
  //     blockchainId: params.blockchainId,
  //     contractConfigurationId: params.contractConfigurationId
  //   })
  // }

  // saveAddressTransaction(params: EvmAddressTransactionCreateParams): Promise<void> {
  //   const addressTransaction = BscAddressTransaction.createAddressTransaction(params)
  //   return this.bscAddressTransactionsEntityService.upsert(addressTransaction)
  // }

  // getIncompleteAddressTransactions(param: EvmAddressTransactionGetByBatchParams): Promise<EvmAddressTransaction[]> {
  //   return this.bscAddressTransactionsEntityService.findRunningByParams(param)
  // }

  // async completeAddressTransaction(addressTransactionId: string): Promise<void> {
  //   await this.bscAddressTransactionsEntityService.complete(addressTransactionId)
  // }

  // getTransactionReceipt(param: EvmTransactionEntitiesGetParams): Promise<EvmReceipt> {
  //   return this.bscReceiptsEntityService.getByTransactionHashAndBlockchain(param)
  // }

  // async saveTransactionReceipt(params: EvmReceiptCreateParams): Promise<EvmReceipt> {
  //   const receipt = BscReceipt.createReceipt(params)
  //   await this.bscReceiptsEntityService.upsert(receipt)
  //   return receipt
  // }

  // countTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<number> {
  //   return this.bscTracesEntityService.countByHash(params)
  // }

  // getTransactionLogs(params: EvmTransactionEntitiesGetParams): Promise<EvmLog[]> {
  //   return this.bscLogsEntityService.getByHash(params)
  // }

  // async saveTransactionLog(params: EvmLogCreateParams): Promise<EvmLog> {
  //   const log = BscLog.createLog(params)
  //   await this.bscLogsEntityService.upsert(log)
  //   return log
  // }

  // getTransactionTraces(params: EvmTransactionEntitiesGetParams): Promise<EvmTrace[]> {
  //   return this.bscTracesEntityService.getByHash(params)
  // }

  // async saveTransactionTrace(params: EvmTraceCreateParams): Promise<void> {
  //   const trace = BscTrace.createTrace(params)
  //   await this.bscTracesEntityService.create(trace)
  // }

  // async saveTransactionDetails(params: EvmTransactionDetailCreateParams): Promise<void> {
  //   const transactionDetail = BscTransactionDetail.createTransactionDetail(params)
  //   await this.bscTransactionDetailsEntityService.upsert(transactionDetail)
  // }

  // getTransactionHashes(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmGetTransactionHashesResult[]> {
  //   return this.bscAddressTransactionsEntityService.getHashesByBatches(params)
  // }

  // getContractAddresses(params: EvmGetContractAddressesFromLogsParams): Promise<string[]> {
  //   return this.bscLogsEntityService.getContractAddresses(params)
  // }

  // getLatestBlockNumberFromBlockReward(param: EvmGetBlockRewardParams): Promise<number> {
  //   throw new Error('Method not implemented.')
  // }

  // saveBlockReward(param: EvmBlockRewardCreateParams): Promise<void> {
  //   throw new Error('Method not implemented.')
  // }

  // getBlockRewards(params: EvmTransactionEntitiesGetByBatchesParams): Promise<EvmBlockReward[]> {
  //   throw new Error('Method not implemented.')
  // }
}
