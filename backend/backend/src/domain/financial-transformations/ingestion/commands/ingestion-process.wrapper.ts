import { Injectable } from '@nestjs/common'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { IngestionProcessTypeEnum } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { LoggerService } from '../../../../shared/logger/logger.service'
import {
  isArbitrumBlockchain,
  isBscBlockchain,
  isEthereumBlockchain,
  isGnosisChainBlockchain,
  isOptimismBlockchain,
  isPolygonBlockchain
} from '../../../../shared/utils/utils'
import { AllTransfersIngestionProcessCommand } from './all-transfers-ingestion-process.command'
import { ContractConfigurationIngestionProcessCommand } from './contract-configuration-ingestion-process.command'
import { EvmBlockRewardProcessCommand } from './evm-block-reward-process.command'
import { EvmLogIngestionProcessCommand } from './evm-log-ingestion-process.command'
import { EvmNativeIngestionProcessCommand } from './evm-native-ingestion-process-command.service'

@Injectable()
export class IngestionProcessWrapper {
  constructor(
    private readonly ingestionProcessEntityService: IngestionProcessEntityService,
    private readonly logger: LoggerService,
    private readonly mainIngestionCommand: AllTransfersIngestionProcessCommand,
    private readonly contractConfigurationIngestionCommand: ContractConfigurationIngestionProcessCommand,
    private readonly evmNativeIngestionProcessCommand: EvmNativeIngestionProcessCommand,
    private readonly evmLogIngestionProcessCommand: EvmLogIngestionProcessCommand,
    private readonly blockRewardProcessCommand: EvmBlockRewardProcessCommand
  ) {}

  async execute(ingestionSyncProcessId: string): Promise<void> {
    const ingestionSyncProcess = await this.ingestionProcessEntityService.get(ingestionSyncProcessId, {
      relations: {
        ingestionWorkflow: true,
        contractConfiguration: true
      }
    })

    if (isEthereumBlockchain(ingestionSyncProcess.ingestionWorkflow.blockchainId)) {
      if (ingestionSyncProcess.type === IngestionProcessTypeEnum.ALL_TRANSFERS) {
        return this.mainIngestionCommand.executeProcess(ingestionSyncProcess)
      }

      if (ingestionSyncProcess.type === IngestionProcessTypeEnum.CONTRACT_CONFIGURATION) {
        await this.contractConfigurationIngestionCommand.executeProcess(ingestionSyncProcess)
      }
    } else if (
      isPolygonBlockchain(ingestionSyncProcess.ingestionWorkflow.blockchainId) ||
      isBscBlockchain(ingestionSyncProcess.ingestionWorkflow.blockchainId) ||
      isArbitrumBlockchain(ingestionSyncProcess.ingestionWorkflow.blockchainId) ||
      isOptimismBlockchain(ingestionSyncProcess.ingestionWorkflow.blockchainId) ||
      isGnosisChainBlockchain(ingestionSyncProcess.ingestionWorkflow.blockchainId)
    ) {
      if (ingestionSyncProcess.type === IngestionProcessTypeEnum.NATIVE_TRANSFERS) {
        return this.evmNativeIngestionProcessCommand.executeProcess(ingestionSyncProcess)
      }

      if (ingestionSyncProcess.type === IngestionProcessTypeEnum.CONTRACT_CONFIGURATION) {
        await this.evmLogIngestionProcessCommand.executeProcess(ingestionSyncProcess)
      }

      if (ingestionSyncProcess.type === IngestionProcessTypeEnum.BLOCK_REWARDS) {
        await this.blockRewardProcessCommand.executeProcess(ingestionSyncProcess)
      }
    } else {
      const message = `IngestionProcessWrapper ${ingestionSyncProcess.id} execute encountered unknown blockchain ${ingestionSyncProcess.ingestionWorkflow.blockchainId}`
      this.logger.error(message)
      throw new Error(message)
    }
  }
}
