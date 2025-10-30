import { Injectable } from '@nestjs/common'
import { TaskSyncType } from '../../../core/events/event-types'
import { ContractConfiguration } from '../../../shared/entity-services/contract-configurations/contract-configuration.entity'
import { ContractConfigurationsEntityService } from '../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../../../shared/entity-services/feature-flags/interfaces'
import { IngestionProcess } from '../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { IngestionProcessEntityService } from '../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { IngestionProcessTypeEnum } from '../../../shared/entity-services/ingestion-process/interfaces'
import { IngestionWorkflow } from '../../../shared/entity-services/ingestion-workflows/ingestion-workflow.entity'
import { RawTransactionEntityService } from '../../../shared/entity-services/raw-transactions/raw-transaction.entity-service'
import { WalletContractConfigurationLogsEntityService } from '../../../shared/entity-services/wallet-contract-configuration-logs/wallet-contract-configuration-logs.entity.service'
import { LoggerService } from '../../../shared/logger/logger.service'
import {
  isArbitrumBlockchain,
  isBscBlockchain,
  isEthereumBlockchain,
  isGnosisChainBlockchain,
  isOptimismBlockchain,
  isPolygonBlockchain
} from '../../../shared/utils/utils'
import { IngestionDataProviderFactory } from './data-providers/ingestion-data-provider.factory'
import { ingestionUtils } from './ingestion.utils' //TODO: How is this a factory pattern??

//TODO: How is this a factory pattern??
@Injectable()
export class IngestionProcessFactory {
  constructor(
    private readonly rawTransactionService: RawTransactionEntityService,
    private readonly contractConfigurationsEntityService: ContractConfigurationsEntityService,
    private readonly walletContractConfigurationLogsEntityService: WalletContractConfigurationLogsEntityService,
    private readonly ingestionProcessEntityService: IngestionProcessEntityService,
    private readonly featureFlagsEntityService: FeatureFlagsEntityService,
    private readonly ingestionDataProviderFactory: IngestionDataProviderFactory,
    private readonly logger: LoggerService
  ) {}

  async createByWorkflow(ingestionWorkflow: IngestionWorkflow): Promise<IngestionProcess[]> {
    if (isEthereumBlockchain(ingestionWorkflow.blockchainId)) {
      const allTransfersProcess = await this.createAllTransfersIngestionProcess(ingestionWorkflow)
      const allContractConfigurationProcesses = await this.createEvmContractConfigurationProcesses(ingestionWorkflow)
      return [allTransfersProcess, ...allContractConfigurationProcesses]
    } else if (
      isPolygonBlockchain(ingestionWorkflow.blockchainId) ||
      isBscBlockchain(ingestionWorkflow.blockchainId) ||
      isArbitrumBlockchain(ingestionWorkflow.blockchainId) ||
      isOptimismBlockchain(ingestionWorkflow.blockchainId) ||
      isGnosisChainBlockchain(ingestionWorkflow.blockchainId)
    ) {
      const evmNativeTransfersProcess = await this.createEvmProcess(ingestionWorkflow, null)
      const allContractConfigurationProcesses = await this.createEvmContractConfigurationProcesses(ingestionWorkflow)

      if (isPolygonBlockchain(ingestionWorkflow.blockchainId)) {
        const blockRewardProcess = await this.createEvmProcessForGettingValidatedBlocks(ingestionWorkflow)
        return [evmNativeTransfersProcess, ...allContractConfigurationProcesses, blockRewardProcess]
      }

      return [evmNativeTransfersProcess, ...allContractConfigurationProcesses]
    } else {
      const message = `Ingestion Workflow invalid blockchain ${ingestionWorkflow.id} { ${ingestionWorkflow.blockchainId}}`
      this.logger.error(message, ingestionWorkflow)
      throw new Error(message)
    }
  }

  private async createAllTransfersIngestionProcess(ingestionWorkflow: IngestionWorkflow) {
    const fromBlock = await this.getLatestBlock({
      address: ingestionWorkflow.address,
      blockchainId: ingestionWorkflow.blockchainId
    })
    const mainProcess = IngestionProcess.create({
      type: IngestionProcessTypeEnum.ALL_TRANSFERS,
      ingestionWorkflow: ingestionWorkflow,
      syncType: TaskSyncType.INCREMENTAL,
      contractConfiguration: null,
      fromBlock
    })
    return await this.ingestionProcessEntityService.create(mainProcess)
  }

  private async getLatestBlock(params: { address: string; blockchainId: string }): Promise<string | null> {
    const fromBlock = await this.rawTransactionService.getLatestBlock({
      address: params.address,
      blockchainId: params.blockchainId
    })
    this.logger.info(
      `Got latest block ${fromBlock} for address ${params.address} and blockchain ${params.blockchainId}`,
      {
        address: params.address,
        blockchainId: params.blockchainId,
        fromBlock
      }
    )
    return fromBlock
  }

  private async createEvmContractConfigurationProcesses(ingestionWorkflow: IngestionWorkflow) {
    const contractConfigurations = await this.contractConfigurationsEntityService.getByBlockchain(
      ingestionWorkflow.blockchainId
    )

    const filteredContractConfigurations = await this.getFilteredContractConfigurations(contractConfigurations)

    const processCreationPromises = filteredContractConfigurations.map((contractConfiguration) =>
      this.createEvmProcess(ingestionWorkflow, contractConfiguration)
    )

    return await Promise.all(processCreationPromises)
  }

  private async createEvmProcess(ingestionWorkflow: IngestionWorkflow, contractConfiguration: ContractConfiguration) {
    const provider = this.ingestionDataProviderFactory.getProvider(ingestionWorkflow.blockchainId)
    const fromBlock = await provider.getLatestBlockNumber({
      address: ingestionWorkflow.address,
      blockchainId: ingestionWorkflow.blockchainId,
      contractConfigurationId: contractConfiguration?.id ?? null
    })
    this.logger.info(
      `Got latest block ${fromBlock} for address ${ingestionWorkflow.address} and blockchain ${ingestionWorkflow.blockchainId}`,
      {
        address: ingestionWorkflow.address,
        blockchainId: ingestionWorkflow.blockchainId,
        fromBlock
      }
    )
    const contractIngestionProcess = IngestionProcess.create({
      type: contractConfiguration
        ? IngestionProcessTypeEnum.CONTRACT_CONFIGURATION
        : IngestionProcessTypeEnum.NATIVE_TRANSFERS,
      ingestionWorkflow: ingestionWorkflow,
      syncType: TaskSyncType.INCREMENTAL,
      contractConfiguration: contractConfiguration ?? null,
      fromBlock
    })
    return this.ingestionProcessEntityService.create(contractIngestionProcess)
  }

  private async createEvmProcessForGettingValidatedBlocks(ingestionWorkflow: IngestionWorkflow) {
    const provider = this.ingestionDataProviderFactory.getProvider(ingestionWorkflow.blockchainId)
    const lastBlock = await provider.getLatestBlockNumberFromBlockReward({
      validatedByAddress: ingestionWorkflow.address,
      blockchainId: ingestionWorkflow.blockchainId
    })
    this.logger.info(
      `Got latest block ${lastBlock} for address ${ingestionWorkflow.address} and blockchain ${ingestionWorkflow.blockchainId} in block reward`,
      {
        address: ingestionWorkflow.address,
        blockchainId: ingestionWorkflow.blockchainId,
        lastBlock
      }
    )

    const blockRewardProcess = IngestionProcess.create({
      type: IngestionProcessTypeEnum.BLOCK_REWARDS,
      ingestionWorkflow: ingestionWorkflow,
      syncType: TaskSyncType.INCREMENTAL,
      contractConfiguration: null,
      fromBlock: lastBlock
    })

    return this.ingestionProcessEntityService.create(blockRewardProcess)
  }

  private async getFilteredContractConfigurations(contractConfigurations: ContractConfiguration[]) {
    const isPolygonNewIngestionPreprocessStrategyEnabled = await this.featureFlagsEntityService.isFeatureEnabled(
      FeatureFlagOption.POLYGON_NEW_INGESTION_PREPROCESS_STRATEGY
    )
    return contractConfigurations.filter((contractConfiguration) =>
      ingestionUtils.isContractConfigurationIsEnabled(contractConfiguration, {
        isPolygonNewIngestionPreprocessStrategyEnabled
      })
    )
  }
}
