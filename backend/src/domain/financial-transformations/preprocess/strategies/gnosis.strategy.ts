import { Injectable } from '@nestjs/common'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { FinancialTransactionsEntityService } from '../../../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { IngestionWorkflowsEntityService } from '../../../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { PreprocessRawTasksEntityService } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'
import { CreateLogPreprocessDtoCommand } from '../commands/create-log-preprocess-dto.command'
import { CreateNativePreprocessDtoCommand } from '../commands/create-native-preprocess-dto.command'
import { CreateOrMigratePreprocessCommand } from '../commands/create-or-migrate-preprocess.command'
import { GetAndCreateCryptocurrenciesCommand } from '../commands/get-and-create-cryptocurrencies-command.service'
import { EvmStrategy } from './evm.strategy'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { CreateFeePreprocessDtoCommand } from '../commands/create-fee-preprocess-dto.command'
import { PreprocessRawTask } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-task.entity'
import { GnosisAddressTransaction } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-address-transaction.entity'
import { hexToNumber, numberToHex } from 'web3-utils'
import { RawTransactionTaskStatusEnum } from '../../../../shared/entity-services/raw-transactions/interfaces'
import { GnosisDataProviderService } from '../../ingestion/data-providers/gnosis-data-provider.service'
import { currencyHelper } from '../../../../shared/helpers/currency.helper'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { PreprocessTypeOrderEnum } from './interfaces'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { EtherscanLog, EtherscanReceipt } from '../../../block-explorers/etherscan/interfaces'
import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { BlockReward } from '../../../block-explorers/interfaces'
import { gnosisCustomLogConfiguration } from '../../../../shared/entity-services/ingestion/evm/gnosis/interfaces'
import { GnosisCustomLog } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-custom-log.entity'
import { TaskSyncType } from '../../../../core/events/event-types'

const Web3EthAbi = require('web3-eth-abi')

@Injectable()
export class GnosisStrategy extends EvmStrategy {
  constructor(
    protected readonly preprocessRawTasksService: PreprocessRawTasksEntityService,
    protected readonly ingestionTaskService: IngestionWorkflowsEntityService,
    protected readonly financialTransactionsService: FinancialTransactionsEntityService,
    protected readonly cryptocurrenciesService: CryptocurrenciesEntityService,
    protected readonly contractConfigurationsEntityService: ContractConfigurationsEntityService,
    protected readonly logger: LoggerService,
    protected readonly ingestionDataProviderFactory: IngestionDataProviderFactory,
    protected readonly createNativePreprocessDtoCommand: CreateNativePreprocessDtoCommand,
    protected readonly createLogPreprocessDtoCommand: CreateLogPreprocessDtoCommand,
    protected readonly getAndCreateCryptocurrenciesCommand: GetAndCreateCryptocurrenciesCommand,
    protected readonly createFeePreprocessDtoCommand: CreateFeePreprocessDtoCommand,
    protected readonly createOrMigratePreprocessCommand: CreateOrMigratePreprocessCommand,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    protected readonly gnosisDataProviderService: GnosisDataProviderService
  ) {
    super(
      preprocessRawTasksService,
      ingestionTaskService,
      financialTransactionsService,
      cryptocurrenciesService,
      contractConfigurationsEntityService,
      logger,
      ingestionDataProviderFactory,
      createNativePreprocessDtoCommand,
      createLogPreprocessDtoCommand,
      getAndCreateCryptocurrenciesCommand,
      createFeePreprocessDtoCommand,
      createOrMigratePreprocessCommand
    )
  }

  protected async preprocessTransactions(task: PreprocessRawTask): Promise<void> {
    await this.saveCustomXDaiBridgeTxs(task)
    return super.preprocessTransactions(task)
  }

  private async saveCustomXDaiBridgeTxs(task: PreprocessRawTask) {
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(task.blockchainId)

    let isLastBlock = false
    let page = 1
    const pageSize = 1000
    do {
      const etherscanLogs = await etherscanAdapter.getLogs({
        // Contract is null because contract were changed in the past, but signature is still the same.
        //so we are looking for logs with the same signature despite contract address
        contractAddress: null,
        topic0: gnosisCustomLogConfiguration.addedReceiverLogConfiguration.topic0,
        topic1: task.address,
        topic2: null,
        topic3: null,
        fromBlock: task.syncType === TaskSyncType.INCREMENTAL ? task.metadata.lastCompletedBlockNumber : null,
        page: page,
        offset: pageSize
      })
      await this.processAddedReceiverLogs(etherscanLogs, task)

      isLastBlock = etherscanLogs.length < pageSize
      page++
    } while (!isLastBlock)
  }

  private async processAddedReceiverLogs(etherscanLogs: EtherscanLog[], task: PreprocessRawTask) {
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(task.blockchainId)
    for (const etherscanLog of etherscanLogs) {
      const etherscanReceipt = await etherscanAdapter.getTransactionReceipt(etherscanLog.transactionHash)

      const affirmationCompletedLogs = etherscanReceipt.logs.filter((log) => this.isAffirmationCompletedLog(log))

      if (!affirmationCompletedLogs.length) {
        continue
      }

      const [block, transaction] = await Promise.all([
        etherscanAdapter.getBlockByNumber(Number(hexToNumber(etherscanLog.blockNumber))),
        etherscanAdapter.getTransactionByHash(etherscanLog.transactionHash)
      ])

      const addressTransaction = GnosisAddressTransaction.create({
        address: task.address,
        blockchainId: task.blockchainId,
        transactionHash: etherscanLog.transactionHash,
        blockNumber: Number(hexToNumber(etherscanLog.blockNumber)),
        contractConfigurationId: null
      })
      addressTransaction.status = RawTransactionTaskStatusEnum.COMPLETED
      await this.gnosisDataProviderService.upsert(addressTransaction)

      await this.gnosisDataProviderService.saveTransactionReceipt({
        blockHash: etherscanReceipt.blockHash,
        blockNumber: Number(hexToNumber(etherscanReceipt.blockNumber)),
        blockTimestamp: block.timeStamp,
        blockchainId: task.blockchainId,
        contractAddress: etherscanReceipt.contractAddress,
        fromAddress: etherscanReceipt.from,
        gasPrice: etherscanReceipt.effectiveGasPrice,
        gasUsed: etherscanReceipt.gasUsed,
        status: etherscanReceipt.status,
        toAddress: etherscanReceipt.to,
        transactionHash: etherscanLog.transactionHash,
        transactionIndex: etherscanReceipt.transactionIndex,
        type: etherscanReceipt.type,
        input: transaction.input,
        value: transaction.value,
        nonce: transaction.nonce,
        feeStats: etherscanReceipt.feeStats ?? null,
        raw: {
          receipt: etherscanReceipt,
          transaction
        }
      })

      for (const affirmationCompletedLog of affirmationCompletedLogs) {
        await this.saveAffirmationCompletedLog({
          receipt: etherscanReceipt,
          block,
          affirmationCompletedLog
        })
      }
    }
  }

  isAffirmationCompletedLog(log: EtherscanLog) {
    return (
      log.topics[0] === gnosisCustomLogConfiguration.affirmationCompletedLogConfiguration.topic0 &&
      log.address === gnosisCustomLogConfiguration.affirmationCompletedLogConfiguration.contractAddress
    )
  }

  getParsedAffirmationCompletedLogData(affirmationCompletedLog: EtherscanLog) {
    // see https://github.com/web3/web3.js/issues/3806
    const logData: { [key: string]: string } = Web3EthAbi.decodeLog(
      gnosisCustomLogConfiguration.affirmationCompletedLogDataAbi,
      affirmationCompletedLog.data,
      affirmationCompletedLog.topics
    )
    if (logData) {
      return {
        value: numberToHex(logData.value),
        recipient: logData.recipient
      }
    } else {
      throw new Error(
        `Could not decode log ${affirmationCompletedLog.transactionHash}:${affirmationCompletedLog.logIndex}`
      )
    }
  }

  private async saveAffirmationCompletedLog(params: {
    affirmationCompletedLog: EtherscanLog
    block: BlockReward
    receipt: EtherscanReceipt
  }) {
    const { affirmationCompletedLog, receipt, block } = params
    const { value, recipient } = this.getParsedAffirmationCompletedLogData(affirmationCompletedLog)

    const customLog = GnosisCustomLog.create({
      contractAddress: params.affirmationCompletedLog.address,
      blockNumber: params.block.blockNumber,
      blockTimestamp: params.block.timeStamp,
      transactionHash: params.affirmationCompletedLog.transactionHash,
      logIndex: Number(hexToNumber(affirmationCompletedLog.logIndex)),
      topic0: params.affirmationCompletedLog.topics?.[0] ?? null,
      topic1: params.affirmationCompletedLog.topics?.[1] ?? null,
      topic2: params.affirmationCompletedLog.topics?.[2] ?? null,
      topic3: params.affirmationCompletedLog.topics?.[3] ?? null,
      data: params.affirmationCompletedLog.data,
      initiatorAddress: params.receipt.from,
      fromAddress: params.affirmationCompletedLog.address,
      toAddress: recipient,
      value: value
    })
    await this.gnosisDataProviderService.upsertCustomLog(customLog)
  }

  protected async createPreprocessDto(params: {
    transactionHash: string
    blockchainId: string
    walletAddress: string
    cryptocurrencies: Cryptocurrency[]
  }): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const dtos = await super.createPreprocessDto(params)
    const customDtos = await this.createXdaiBridgePreprocessDto(params)
    return [...dtos, ...customDtos]
  }

  async createXdaiBridgePreprocessDto(params: {
    transactionHash: string
    blockchainId: string
    walletAddress: string
    cryptocurrencies: Cryptocurrency[]
  }) {
    const coin = currencyHelper.getCryptocurrencyCoin(params.cryptocurrencies, params.blockchainId)

    const customLogs = await this.gnosisDataProviderService.getCustomLogs(params.transactionHash)

    const dtos: CreateFinancialTransactionPreprocessDto[] = []
    for (const customLog of customLogs) {
      const amount = currencyHelper.formatHexWadAmountForCryptocurrency(customLog.value, coin, params.blockchainId)

      const dto: CreateFinancialTransactionPreprocessDto = {
        forPublicIdGeneration: `${customLog.transactionHash}:${params.blockchainId}:log:${customLog.logIndex}`,
        typeOrder: PreprocessTypeOrderEnum.ERC20_LOG_TYPE_ORDER,
        order: customLog.logIndex,
        hash: customLog.transactionHash,
        blockchainId: params.blockchainId,
        fromAddress: customLog.fromAddress,
        toAddress: customLog.toAddress,
        initiatorAddress: customLog.initiatorAddress,
        cryptocurrency: coin,
        cryptocurrencyAmount: amount.toString(),
        valueTimestamp: dateHelper.getUTCTimestampFrom(customLog.blockTimestamp),
        status: FinancialTransactionPreprocessStatus.COMPLETED
      }
      dtos.push(dto)
    }

    return dtos
  }
}
