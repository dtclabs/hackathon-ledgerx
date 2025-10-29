import { EventEmitter2 } from '@nestjs/event-emitter'
import { hexToNumber } from 'web3-utils'
import { ContractConfiguration } from '../../../../shared/entity-services/contract-configurations/contract-configuration.entity'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { ContractConfigurationPlaceholderEnum } from '../../../../shared/entity-services/contract-configurations/interfaces'
import { FeatureFlagsEntityService } from '../../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../../../../shared/entity-services/feature-flags/interfaces'
import { IngestionProcess } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import {
  EvmIngestionPaginationMetadata,
  EvmLogIngestionTaskMetadata,
  EvmNativeIngestionTaskMetadata
} from '../../../../shared/entity-services/ingestion-process/interfaces'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { isArbitrumBlockchain } from '../../../../shared/utils/utils'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { BlockExplorersProviderEnum } from '../../../block-explorers/block-explorers-provider.enum'
import { EtherscanLog } from '../../../block-explorers/etherscan/interfaces'
import { IngestionDataProviderFactory } from '../data-providers/ingestion-data-provider.factory'
import { ingestionUtils } from '../ingestion.utils'
import { IngestionProcessCommand } from './ingestion-process.command'

export abstract class EvmIngestionProcessCommand<
  T extends EvmNativeIngestionTaskMetadata | EvmLogIngestionTaskMetadata
> extends IngestionProcessCommand<T> {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    protected readonly ingestionDataProviderFactory: IngestionDataProviderFactory,
    protected readonly ingestionProcessEntityService: IngestionProcessEntityService,
    protected readonly logger: LoggerService,
    protected readonly contractConfigurationsEntityService: ContractConfigurationsEntityService,
    protected readonly featureFlagsEntityService: FeatureFlagsEntityService
  ) {
    super(eventEmitter, ingestionProcessEntityService, logger)
  }

  protected async saveHashes(params: {
    address: string
    blockchainId: string
    contractConfigurationId: string
    data: { blockNumber: number; transactionHash: string }[]
  }) {
    const provider = this.ingestionDataProviderFactory.getProvider(params.blockchainId)

    for (const log of params.data) {
      await provider.saveAddressTransaction({
        address: params.address,
        contractConfigurationId: params.contractConfigurationId,
        transactionHash: log.transactionHash,
        blockchainId: params.blockchainId,
        blockNumber: Number(hexToNumber(log.blockNumber))
      })
    }
  }

  protected async populateData(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: T
  }) {
    const dataProviderService = this.ingestionDataProviderFactory.getProvider(params.blockchainId)
    const contractConfigurations = await this.contractConfigurationsEntityService.getByBlockchain(params.blockchainId)

    const addressTransactions = await dataProviderService.getIncompleteAddressTransactions({
      blockchainId: params.blockchainId,
      address: params.address,
      contractConfigurationId: params.ingestionProcess.contractConfiguration?.id ?? null,
      pageSize: params.metadata.pageSize
    })

    if (!addressTransactions.length) {
      await this.next(params.ingestionProcess, {
        ...params.metadata,
        saving: true,
        page: 0
      })
      return
    }

    for (const addressTransaction of addressTransactions) {
      await this.saveReceiptAndLogs({
        address: params.address,
        blockchainId: params.blockchainId,
        transactionHash: addressTransaction.hash,
        blockNumber: addressTransaction.blockNumber,
        allContractConfigurations: contractConfigurations
      })
      await this.saveInternalTransactions({
        blockchainId: params.blockchainId,
        transactionHash: addressTransaction.hash
      })
      await dataProviderService.completeAddressTransaction(addressTransaction.id)
    }

    await this.next(params.ingestionProcess, {
      ...params.metadata,
      page: params.metadata.page + 1
    })
  }

  async saveReceiptAndLogs(params: {
    blockchainId: string
    address: string
    blockNumber: number
    transactionHash: string
    allContractConfigurations: ContractConfiguration[]
  }) {
    const dataProviderService = this.ingestionDataProviderFactory.getProvider(params.blockchainId)
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(params.blockchainId)

    const receipt = await dataProviderService.getTransactionReceipt({
      blockchainId: params.blockchainId,
      transactionHash: params.transactionHash
    })
    if (!receipt) {
      const [block, etherscanReceipt, transaction] = await Promise.all([
        etherscanAdapter.getBlockByNumber(params.blockNumber),
        etherscanAdapter.getTransactionReceipt(params.transactionHash),
        etherscanAdapter.getTransactionByHash(params.transactionHash)
      ])

      if (!block) {
        this.logger.error(`Block not found for transaction`, {
          blockchainId: params.blockchainId,
          transactionHash: params.transactionHash,
          blockNumber: params.blockNumber,
          address: params.address
        })
        throw new Error(`Block not found for transaction ${params.transactionHash}`)
      }

      if (!etherscanReceipt) {
        this.logger.error(`Receipt not found for transaction`, {
          blockchainId: params.blockchainId,
          transactionHash: params.transactionHash,
          address: params.address
        })
        throw new Error(`Receipt not found for transaction ${params.transactionHash}`)
      }

      if (isArbitrumBlockchain(params.blockchainId)) {
        // https://docs.alchemy.com/reference/eth-gettransactionreceipt-arbitrum-1
        // Additional data for arbitrum that we require and only alchemy provides
        const alchemyAdapter = this.blockExplorerAdapterFactory.getBlockExplorerAdapter(
          BlockExplorersProviderEnum.ALCHEMY,
          params.blockchainId
        )
        // Type assertion since we know this is an Alchemy adapter for Arbitrum
        const alchemyReceipt = await (alchemyAdapter as any).getTransactionReceiptViaAPI(params.transactionHash)

        // https://arbiscan.io/tx/0xd921c06aa336c2fbd5d064c6654a4a546d5724f239d90e6eef45d702da2e044f
        // Arbiscan API is returning wrong data for 'from' field
        const arbitrumArbRetryableTx = '0x000000000000000000000000000000000000006e'
        const incorrectArbiscanFromAddress = '0x0000000000000000000000000000000000000000'

        if (etherscanReceipt.to === arbitrumArbRetryableTx) {
          if (etherscanReceipt.from === incorrectArbiscanFromAddress) {
            etherscanReceipt.from = alchemyReceipt.from
          }
        }

        // Arbitrum fee is not as simple as gas used * gas price
        etherscanReceipt.feeStats = (alchemyReceipt as any)?.feeStats
      }

      for (const log of etherscanReceipt.logs) {
        await this.populateLog({
          blockTimestamp: block.timeStamp,
          blockchainId: params.blockchainId,
          initiatorAddress: etherscanReceipt.from,
          log,
          allContractConfigurations: params.allContractConfigurations
        })
      }

      await dataProviderService.saveTransactionReceipt({
        blockHash: etherscanReceipt.blockHash,
        blockNumber: Number(hexToNumber(etherscanReceipt.blockNumber)),
        blockTimestamp: block.timeStamp,
        blockchainId: params.blockchainId,
        contractAddress: etherscanReceipt.contractAddress,
        fromAddress: etherscanReceipt.from,
        gasPrice: etherscanReceipt.effectiveGasPrice,
        gasUsed: etherscanReceipt.gasUsed,
        status: etherscanReceipt.status,
        toAddress: etherscanReceipt.to,
        transactionHash: params.transactionHash,
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
    } else {
      const etherscanReceipt = await etherscanAdapter.getTransactionReceipt(params.transactionHash)
      for (const log of etherscanReceipt.logs) {
        await this.populateLog({
          blockTimestamp: receipt.blockTimestamp,
          blockchainId: params.blockchainId,
          initiatorAddress: receipt.fromAddress,
          log,
          allContractConfigurations: params.allContractConfigurations
        })
      }
    }
  }

  async populateLog(params: {
    log: EtherscanLog
    blockTimestamp: string
    blockchainId: string
    initiatorAddress: string
    allContractConfigurations: ContractConfiguration[]
  }) {
    const { log } = params
    const dataProviderService = this.ingestionDataProviderFactory.getProvider(params.blockchainId)
    const contractConfiguration = params.allContractConfigurations.find((contractConfiguration) =>
      ingestionUtils.isLogMatchConfiguration({
        contractConfiguration,
        logTopic0: log.topics?.[0],
        logTopic1: log.topics?.[1],
        logTopic2: log.topics?.[2],
        logTopic3: log.topics?.[3]
      })
    )
    if (!contractConfiguration) {
      return
    }

    const isPolygonNewIngestionPreprocessStrategyEnabled = await this.featureFlagsEntityService.isFeatureEnabled(
      FeatureFlagOption.POLYGON_NEW_INGESTION_PREPROCESS_STRATEGY
    )

    const isConfigurationEnabled = ingestionUtils.isContractConfigurationIsEnabled(contractConfiguration, {
      isPolygonNewIngestionPreprocessStrategyEnabled
    })
    if (!isConfigurationEnabled) {
      return
    }

    await dataProviderService.saveTransactionLog({
      contractAddress: log.address,
      blockHash: log.blockHash,
      blockNumber: log.blockNumber,
      blockTimestamp: params.blockTimestamp,
      blockchainId: params.blockchainId,
      transactionHash: log.transactionHash,
      logIndex: Number.parseInt(log.logIndex),
      topic0: log.topics?.[0] ?? null,
      topic1: log.topics?.[1] ?? null,
      topic2: log.topics?.[2] ?? null,
      topic3: log.topics?.[3] ?? null,
      data: log.data,
      initiatorAddress: params.initiatorAddress,
      fromAddress: ingestionUtils.getAddressFromLog(
        log,
        contractConfiguration,
        ContractConfigurationPlaceholderEnum.ADDRESS_OUT
      ),
      toAddress: ingestionUtils.getAddressFromLog(
        log,
        contractConfiguration,
        ContractConfigurationPlaceholderEnum.ADDRESS_IN
      )
    })
  }

  private async saveInternalTransactions(params: { blockchainId: string; transactionHash: string }) {
    const dataProviderService = this.ingestionDataProviderFactory.getProvider(params.blockchainId)
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(params.blockchainId)

    const amountOfTraces = await dataProviderService.countTransactionTraces({
      blockchainId: params.blockchainId,
      transactionHash: params.transactionHash
    })

    if (amountOfTraces) {
      return
    }

    const traces = await etherscanAdapter.getTransactionInternalsByTransactionHash(params.transactionHash)
    for (const trace of traces) {
      const index = traces.indexOf(trace)
      const blockTimestamp = dateHelper.fromUnixTimestampToDate(Number.parseInt(trace.timeStamp))
      await dataProviderService.saveTransactionTrace({
        blockNumber: Number.parseInt(trace.blockNumber),
        blockTimestamp: blockTimestamp.toISOString(),
        status: trace.isError,
        callType: trace.type,
        blockchainId: params.blockchainId,
        transactionHash: params.transactionHash,
        fromAddress: trace.from,
        toAddress: trace.to,
        value: trace.value,
        gas: trace.gas,
        gasUsed: trace.gasUsed,
        input: trace.input,
        errorCode: trace.errCode,
        traceId: null, //
        traceIndex: index
      })
    }
  }

  // Etherscan has limit of 10k records per Result window. So we use a little trick to get all the data.
  // We start from the new latest block when pageSize * Page > 10k.
  // Which is the current latest block - 1 among ALL txs hashes
  async getEtherscanPaginationParams(
    originalPaginationParams: EvmIngestionPaginationMetadata,
    lastBlockNumber: number
  ): Promise<EvmIngestionPaginationMetadata> {
    if (originalPaginationParams.page * originalPaginationParams.pageSize < 10000) {
      return {
        fromBlock: originalPaginationParams.fromBlock,
        page: originalPaginationParams.page + 1,
        pageSize: originalPaginationParams.pageSize,
        tempBlock: originalPaginationParams.tempBlock
      }
    }

    return {
      fromBlock: originalPaginationParams.fromBlock,
      pageSize: originalPaginationParams.pageSize,
      page: 1,
      tempBlock: lastBlockNumber - 1
    }
  }
}
