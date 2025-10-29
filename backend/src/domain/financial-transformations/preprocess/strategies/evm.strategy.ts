import { Injectable } from '@nestjs/common'
import { TaskStatusEnum } from '../../../../core/events/event-types'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { FinancialTransactionsEntityService } from '../../../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { CreateFinancialTransactionPreprocessDto } from '../../../../shared/entity-services/financial-transactions/interfaces'
import { IngestionWorkflowsEntityService } from '../../../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { EvmGetTransactionHashesResult } from '../../../../shared/entity-services/ingestion/evm/interfaces'
import { PreprocessRawTask } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-task.entity'
import { PreprocessRawTasksEntityService } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'
import { CreateFeePreprocessDtoCommand } from '../commands/create-fee-preprocess-dto.command'
import { CreateLogPreprocessDtoCommand } from '../commands/create-log-preprocess-dto.command'
import { CreateNativePreprocessDtoCommand } from '../commands/create-native-preprocess-dto.command'
import { CreateOrMigratePreprocessCommand } from '../commands/create-or-migrate-preprocess.command'
import { GetAndCreateCryptocurrenciesCommand } from '../commands/get-and-create-cryptocurrencies-command.service'
import { CreateEvmPreprocessDtoParams, PreprocessStrategy } from './interfaces'

@Injectable()
export class EvmStrategy implements PreprocessStrategy {
  readonly BATCH_SIZE: number = 500

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
    protected readonly createOrMigratePreprocessCommand: CreateOrMigratePreprocessCommand
  ) {}

  async execute(task: PreprocessRawTask): Promise<void> {
    await this.preprocessRawTasksService.updateFirstExecutedAt(task)

    await this.preprocessTransactions(task)

    await this.additionalTransformations(task)

    await this.changeTaskStatus(task.id, TaskStatusEnum.COMPLETED)
  }

  protected async preprocessTransactions(task: PreprocessRawTask): Promise<void> {
    let skip = 0
    let blockNoAndTxnHashList: EvmGetTransactionHashesResult[] = []

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

      await this.processTransactions(task, blockNoAndTxnHashList)
      skip += this.BATCH_SIZE
    } while (blockNoAndTxnHashList.length === this.BATCH_SIZE)
  }

  protected async processTransactions(task: PreprocessRawTask, blockNoAndTxnHashList: EvmGetTransactionHashesResult[]) {
    if (blockNoAndTxnHashList.length) {
      const cryptocurrencies = await this.getAndCreateCryptocurrenciesCommand.execute({
        address: task.address,
        blockchainId: task.blockchainId,
        transactionHashes: blockNoAndTxnHashList.map((t) => t.transactionHash)
      })

      for (const transactionHash of blockNoAndTxnHashList) {
        const dtos = await this.createPreprocessDto({
          transactionHash: transactionHash.transactionHash,
          blockchainId: task.blockchainId,
          walletAddress: task.address,
          cryptocurrencies: cryptocurrencies
        })
        await this.createOrMigratePreprocess(transactionHash.transactionHash, dtos)
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
      const logDtos = await this.createLogPreprocessDtoCommand.execute(createEvmPreprocessDtoParams)

      return [...nativeDtos, ...logDtos, ...feeDtos]
    }
  }

  protected createOrMigratePreprocess(hash: string, preprocessDtos: CreateFinancialTransactionPreprocessDto[]) {
    return this.createOrMigratePreprocessCommand.execute(hash, preprocessDtos)
  }

  protected updateLastExecutedAt(taskId: string) {
    return this.preprocessRawTasksService.updateLastExecutedAt(taskId)
  }

  protected updateLastCompletedBlockNumber(task: PreprocessRawTask, lastCompletedBlockNumber: number) {
    return this.preprocessRawTasksService.updateMetadata(task.id, {
      ...task.metadata,
      lastCompletedBlockNumber: lastCompletedBlockNumber
    })
  }

  protected changeTaskStatus(taskId: string, status: TaskStatusEnum) {
    return this.preprocessRawTasksService.changeStatus(taskId, status)
  }

  protected async additionalTransformations(task: PreprocessRawTask) {
    //   Can be overwritten in child classes;
  }
}
