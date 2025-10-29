import { Injectable } from '@nestjs/common'
import { EvmStrategy } from './evm.strategy'
import { PreprocessRawTasksEntityService } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { IngestionWorkflowsEntityService } from '../../../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { FinancialTransactionsEntityService } from '../../../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'
import { CreateNativePreprocessDtoCommand } from '../commands/create-native-preprocess-dto.command'
import { CreateLogPreprocessDtoCommand } from '../commands/create-log-preprocess-dto.command'
import { GetAndCreateCryptocurrenciesCommand } from '../commands/get-and-create-cryptocurrencies-command.service'
import { CreateFeePreprocessDtoCommand } from '../commands/create-fee-preprocess-dto.command'
import { CreateOrMigratePreprocessCommand } from '../commands/create-or-migrate-preprocess.command'
import { PreprocessRawTask } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-task.entity'
import { CreateEvmPreprocessDtoParams, GetTransactionsParams } from './interfaces'
import { EvmBlockReward } from '../../../../shared/entity-services/ingestion/evm/evm-block-reward.entity'
import { CreateBlockRewardPreprocessDtoCommand } from '../commands/create-block-reward-preprocess-dto.command'
import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { CreateFinancialTransactionPreprocessDto } from '../../../../shared/entity-services/financial-transactions/interfaces'
import { FeatureFlagsEntityService } from '../../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../../../../shared/entity-services/feature-flags/interfaces'

@Injectable()
export class PolygonStrategy extends EvmStrategy {
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
    protected readonly createBlockRewardPreprocessDtoCommand: CreateBlockRewardPreprocessDtoCommand,
    private readonly featureFlagsService: FeatureFlagsEntityService
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

  protected async additionalTransformations(task: PreprocessRawTask) {
    const nativeCoin = await this.cryptocurrenciesService.getCoinByBlockchain(task.blockchainId)

    const callback = async (evmBlockRewards: EvmBlockReward[]) => {
      for (const evmBlockReward of evmBlockRewards) {
        if (evmBlockReward.blockReward.toString() === '0') {
          continue
        }

        const dtos = await this.createBlockRewardPreprocessDtoCommand.execute({
          blockchainId: task.blockchainId,
          walletAddress: task.address,
          evmBlockReward: evmBlockReward,
          nativeCoin
        })
        await this.createOrMigratePreprocessCommand.execute(evmBlockReward.blockNumber.toString(), dtos)
        await this.updateLastExecutedAt(task.id)
      }
    }

    await this.getBlockRewardsByBatches(
      {
        address: task.address,
        blockchainId: task.blockchainId,
        startingBlockNumber: task.metadata.lastCompletedValidatedBlockNumber ?? 0
      },
      callback
    )
  }

  protected async getBlockRewardsByBatches(
    params: GetTransactionsParams,
    callback: (rawTransactions: EvmBlockReward[]) => Promise<void>
  ): Promise<void> {
    let skip = 0
    let transactions: EvmBlockReward[] = []

    do {
      transactions = await this.ingestionDataProviderFactory.getProvider(params.blockchainId).getBlockRewards({
        address: params.address,
        blockchainId: params.blockchainId,
        startingBlockNumber: params.startingBlockNumber,
        skip: skip,
        limit: this.BATCH_SIZE
      })

      await callback(transactions)
      skip += this.BATCH_SIZE
    } while (transactions.length === this.BATCH_SIZE)
  }

  // This method is overridden from EvmStrategy,
  // All the native transfers (except fee) is tracking by 0x0000000000000000000000000000000000001010 contract's LogTransfer event.
  // It is very important to have contractConfiguration for topic 0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4
  // The reason why it was changed, because of transaction https://polygonscan.com/tx/0x2477c28358d0e42398397a5e17cefbd2fe07d5ae610b2821b2d4c6cf79735a39
  // For address 0x6086363B283c7869c9124eE23E541F4eC337A8f6 there is undocumented transfer, which we can not get by any other way
  protected async createPreprocessDto(params: {
    transactionHash: string
    blockchainId: string
    walletAddress: string
    cryptocurrencies: Cryptocurrency[]
  }): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const isPolygonNewIngestionPreprocessStrategyEnabled = await this.featureFlagsService.isFeatureEnabled(
      FeatureFlagOption.POLYGON_NEW_INGESTION_PREPROCESS_STRATEGY
    )
    if (!isPolygonNewIngestionPreprocessStrategyEnabled) {
      return super.createPreprocessDto(params)
    }

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
      const logDtos = await this.createLogPreprocessDtoCommand.execute(createEvmPreprocessDtoParams)

      return [...logDtos, ...feeDtos]
    }
  }
}
