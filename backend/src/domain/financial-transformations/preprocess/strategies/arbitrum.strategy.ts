import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { formatUnits } from 'ethers/lib/utils'
import { SupportedBlockchains } from '../../../../shared/entity-services/blockchains/interfaces'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { FinancialTransactionsEntityService } from '../../../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessSpecialAccount,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { IngestionWorkflowsEntityService } from '../../../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { EvmGetTransactionHashesResult } from '../../../../shared/entity-services/ingestion/evm/interfaces'
import { PreprocessRawTask } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-task.entity'
import { PreprocessRawTasksEntityService } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { currencyHelper } from '../../../../shared/helpers/currency.helper'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'
import { CreateFeePreprocessDtoCommand } from '../commands/create-fee-preprocess-dto.command'
import { CreateLogPreprocessDtoCommand } from '../commands/create-log-preprocess-dto.command'
import { CreateNativePreprocessDtoCommand } from '../commands/create-native-preprocess-dto.command'
import { CreateOrMigratePreprocessCommand } from '../commands/create-or-migrate-preprocess.command'
import { GetAndCreateCryptocurrenciesCommand } from '../commands/get-and-create-cryptocurrencies-command.service'
import { EvmStrategy } from './evm.strategy'
import { CreateEvmPreprocessDtoParams } from './interfaces'

@Injectable()
export class ArbitrumStrategy extends EvmStrategy {
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
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory
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
    let skip = 0
    let blockNoAndTxnHashList: EvmGetTransactionHashesResult[] = []
    // Default to 1 because block number starts with 1
    let lastCompletedBlockNumber = task.metadata?.lastCompletedBlockNumber ?? 1

    do {
      blockNoAndTxnHashList = await this.ingestionDataProviderFactory
        .getProvider(task.blockchainId)
        .getTransactionHashes({
          address: task.address,
          blockchainId: task.blockchainId,
          startingBlockNumber: task.metadata.lastCompletedBlockNumber,
          skip: skip,
          limit: this.BATCH_SIZE
        })

      await this.processTransactions(task, blockNoAndTxnHashList, lastCompletedBlockNumber)
      lastCompletedBlockNumber = blockNoAndTxnHashList?.at(-1)?.blockNumber
      skip += this.BATCH_SIZE
    } while (blockNoAndTxnHashList.length === this.BATCH_SIZE)
  }

  protected async processTransactions(
    task: PreprocessRawTask,
    blockNoAndTxnHashList: EvmGetTransactionHashesResult[],
    lastCompletedBlockNumber?: number
  ) {
    if (blockNoAndTxnHashList.length) {
      const cryptocurrencies = await this.getAndCreateCryptocurrenciesCommand.execute({
        address: task.address,
        blockchainId: task.blockchainId,
        transactionHashes: blockNoAndTxnHashList.map((t) => t.transactionHash)
      })

      for (const blockNoAndTxnHash of blockNoAndTxnHashList) {
        const dtos = await this.createPreprocessDto({
          transactionHash: blockNoAndTxnHash.transactionHash,
          blockchainId: task.blockchainId,
          walletAddress: task.address,
          cryptocurrencies: cryptocurrencies,
          blockNumber: blockNoAndTxnHash.blockNumber,
          lastCompletedBlockNumber
        })
        lastCompletedBlockNumber = blockNoAndTxnHash.blockNumber
        await this.createOrMigratePreprocess(blockNoAndTxnHash.transactionHash, dtos)
        await this.updateLastExecutedAt(task.id)
      }
      await this.updateLastCompletedBlockNumber(task, blockNoAndTxnHashList.at(-1).blockNumber)
    }
  }

  protected async createPreprocessDto(params: {
    transactionHash: string
    blockchainId: string
    walletAddress: string
    cryptocurrencies: Cryptocurrency[]
    blockNumber?: number
    lastCompletedBlockNumber?: number
  }): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const provider = this.ingestionDataProviderFactory.getProvider(params.blockchainId)
    const transactionReceipt = await provider.getTransactionReceipt(params)

    const createEvmPreprocessDtoParams: CreateEvmPreprocessDtoParams = {
      walletAddress: params.walletAddress,
      transactionHash: params.transactionHash,
      blockchainId: params.blockchainId,
      receipt: transactionReceipt,
      cryptocurrencies: params.cryptocurrencies
    }

    const feeDtos = await this.createFeePreprocessDtoCommand.execute(createEvmPreprocessDtoParams)

    if (transactionReceipt.isError) {
      return [...feeDtos]
    } else {
      const nativeDtos = await this.createNativePreprocessDtoCommand.execute(createEvmPreprocessDtoParams)

      const correctingBalanceDto = await this.generateCorrectingBalanceForWalletAddress(
        createEvmPreprocessDtoParams,
        params.blockNumber,
        params.lastCompletedBlockNumber,
        [...nativeDtos, ...feeDtos]
      )

      const logDtos = await this.createLogPreprocessDtoCommand.execute(createEvmPreprocessDtoParams)

      return [...nativeDtos, correctingBalanceDto, ...logDtos, ...feeDtos].filter((e) => !!e)
    }
  }

  async generateCorrectingBalanceForWalletAddress(
    params: CreateEvmPreprocessDtoParams,
    currentBlockNumber: number,
    lastCompletedBlockNumber: number,
    dtos: CreateFinancialTransactionPreprocessDto[]
  ) {
    const alchemyAdapter = this.blockExplorerAdapterFactory.getAlchemyAdapter(SupportedBlockchains.ARBITRUM_ONE)

    const [lastCompletedBalance, currentBalance] = await Promise.all([
      alchemyAdapter.getBalanceByBlockNumberViaAPI(params.walletAddress, lastCompletedBlockNumber),
      alchemyAdapter.getBalanceByBlockNumberViaAPI(params.walletAddress, currentBlockNumber)
    ])

    const differenceInBalance = new Decimal(currentBalance.toString()).sub(lastCompletedBalance.toString())
    // ETH has 18 decimals
    const formattedDifferenceFromThirdParty = new Decimal(formatUnits(differenceInBalance.toString(), 18))

    let generatedDifference = new Decimal(0)
    for (const dto of dtos) {
      if (dto.fromAddress === params.walletAddress && dto.toAddress === params.walletAddress) {
        continue
      } else if (dto.fromAddress === params.walletAddress) {
        generatedDifference = generatedDifference.sub(dto.cryptocurrencyAmount)
      } else if (dto.toAddress === params.walletAddress) {
        generatedDifference = generatedDifference.add(dto.cryptocurrencyAmount)
      }
    }

    if (!formattedDifferenceFromThirdParty.equals(generatedDifference)) {
      const correctingBalance = formattedDifferenceFromThirdParty.sub(generatedDifference)

      const from = correctingBalance.isPositive()
        ? FinancialTransactionPreprocessSpecialAccount.CORRECTING_BALANCE_ACCOUNT
        : params.walletAddress
      const to = correctingBalance.isPositive()
        ? params.walletAddress
        : FinancialTransactionPreprocessSpecialAccount.CORRECTING_BALANCE_ACCOUNT

      const dto: CreateFinancialTransactionPreprocessDto = {
        forPublicIdGeneration: `${params.transactionHash}:${params.blockchainId}:correcting`,
        hash: params.transactionHash,
        blockchainId: params.blockchainId,
        fromAddress: from,
        toAddress: to,
        initiatorAddress: params.receipt.fromAddress,
        cryptocurrency: currencyHelper.getCryptocurrencyCoin(params.cryptocurrencies, params.blockchainId),
        cryptocurrencyAmount: correctingBalance.absoluteValue().toString(),
        valueTimestamp: dateHelper.getUTCTimestampFrom(params.receipt.blockTimestamp),
        status: FinancialTransactionPreprocessStatus.COMPLETED
      }
      return dto
    }
  }
}
