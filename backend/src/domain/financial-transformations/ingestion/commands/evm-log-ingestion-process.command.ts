import { Injectable } from '@nestjs/common'
import { IngestionProcess } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { EvmLogIngestionTaskMetadata } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { ConfigService } from '@nestjs/config'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { hexToNumber } from 'web3-utils'
import { IngestionDataProviderFactory } from '../data-providers/ingestion-data-provider.factory'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { EvmIngestionProcessCommand } from './evm-ingestion-process.command'
import { ContractConfigurationPlaceholderEnum } from '../../../../shared/entity-services/contract-configurations/interfaces'
import { FeatureFlagsEntityService } from '../../../../shared/entity-services/feature-flags/feature-flags.entity-service'

@Injectable()
export class EvmLogIngestionProcessCommand extends EvmIngestionProcessCommand<EvmLogIngestionTaskMetadata> {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    protected readonly ingestionDataProviderFactory: IngestionDataProviderFactory,
    protected readonly configService: ConfigService,
    protected readonly ingestionProcessEntityService: IngestionProcessEntityService,
    protected readonly logger: LoggerService,
    protected readonly contractConfigurationsEntityService: ContractConfigurationsEntityService,
    protected readonly featureFlagsEntityService: FeatureFlagsEntityService
  ) {
    super(
      eventEmitter,
      blockExplorerAdapterFactory,
      ingestionDataProviderFactory,
      ingestionProcessEntityService,
      logger,
      contractConfigurationsEntityService,
      featureFlagsEntityService
    )
  }

  async pullAndSaveData(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: EvmLogIngestionTaskMetadata
  }): Promise<void> {
    if (!params.metadata.logsTo) {
      await this.getHashesFromLogs({
        ...params,
        direction: ContractConfigurationPlaceholderEnum.ADDRESS_IN
      })
      return
    }
    if (!params.metadata.logsFrom) {
      await this.getHashesFromLogs({
        ...params,
        direction: ContractConfigurationPlaceholderEnum.ADDRESS_OUT
      })
      return
    }
    if (!params.metadata.saving) {
      await this.populateData({
        ...params,
        metadata: {
          ...params.metadata,
          pageSize: 50 // For saving data. Making batch smaller
        }
      })
      return
    }
    await this.complete(params.ingestionProcess)
  }

  protected getNewMetadataForNewProcess(terminatedProcess: IngestionProcess): EvmLogIngestionTaskMetadata {
    const metadata = terminatedProcess.metadata as EvmLogIngestionTaskMetadata
    return {
      fromBlock: metadata.fromBlock,
      page: 1,
      pageSize: metadata.pageSize,
      logsTo: metadata.logsTo,
      logsFrom: metadata.logsFrom,
      saving: metadata.saving,
      tempBlock: metadata.tempBlock
    }
  }

  private async getHashesFromLogs(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: EvmLogIngestionTaskMetadata
    direction: ContractConfigurationPlaceholderEnum
  }) {
    const { ingestionProcess, blockchainId, address, metadata } = params

    const contractConfiguration = ingestionProcess.contractConfiguration

    if (!contractConfiguration) {
      this.logger.error(`Contract configuration is not set for process ${ingestionProcess.id}`, ingestionProcess)
      return
    }
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(blockchainId)

    if (
      !(
        contractConfiguration.topic1 === params.direction ||
        contractConfiguration.topic2 === params.direction ||
        contractConfiguration.topic3 === params.direction
      )
    ) {
      //   There no from or to address in contract configuration
      await this.next(ingestionProcess, {
        ...metadata,
        ...(ContractConfigurationPlaceholderEnum.ADDRESS_OUT === params.direction ? { logsFrom: true } : {}),
        ...(ContractConfigurationPlaceholderEnum.ADDRESS_IN === params.direction ? { logsTo: true } : {}),
        page: 0,
        tempBlock: null
      })
      return
    }

    const logs = await etherscanAdapter.getLogs({
      contractAddress: contractConfiguration.contractAddress,
      topic0: contractConfiguration.topic0,
      topic1: contractConfiguration.topic1 === params.direction ? address : null,
      topic2: contractConfiguration.topic2 === params.direction ? address : null,
      topic3: contractConfiguration.topic3 === params.direction ? address : null,
      fromBlock: metadata.tempBlock ?? metadata.fromBlock,
      page: metadata.page,
      offset: metadata.pageSize
    })

    if (!logs.length) {
      await this.next(ingestionProcess, {
        ...metadata,
        ...(ContractConfigurationPlaceholderEnum.ADDRESS_OUT === params.direction ? { logsFrom: true } : {}),
        ...(ContractConfigurationPlaceholderEnum.ADDRESS_IN === params.direction ? { logsTo: true } : {}),
        page: 0,
        tempBlock: null
      })
      return
    }

    await this.saveHashes({
      contractConfigurationId: contractConfiguration.id,
      blockchainId,
      address,
      data: logs.map((log) => ({
        transactionHash: log.transactionHash,
        blockNumber: Number(hexToNumber(log.blockNumber))
      }))
    })

    const lastBlockNumber = Number.parseInt(logs[logs.length - 1].blockNumber)
    const paginationMetadata = await this.getEtherscanPaginationParams(metadata, lastBlockNumber)

    await this.next(ingestionProcess, {
      ...metadata,
      ...paginationMetadata
    })
  }
}
