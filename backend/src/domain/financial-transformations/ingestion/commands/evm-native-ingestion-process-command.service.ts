import { Injectable } from '@nestjs/common'
import { IngestionProcess } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { EvmNativeIngestionTaskMetadata } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../data-providers/ingestion-data-provider.factory'
import { EvmIngestionProcessCommand } from './evm-ingestion-process.command'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { FeatureFlagsEntityService } from '../../../../shared/entity-services/feature-flags/feature-flags.entity-service'

@Injectable()
export class EvmNativeIngestionProcessCommand extends EvmIngestionProcessCommand<EvmNativeIngestionTaskMetadata> {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    protected readonly ingestionDataProviderFactory: IngestionDataProviderFactory,
    protected readonly ingestionProcessEntityService: IngestionProcessEntityService,
    protected readonly contractConfigurationsEntityService: ContractConfigurationsEntityService,
    protected readonly logger: LoggerService,
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
    metadata: EvmNativeIngestionTaskMetadata
  }): Promise<void> {
    if (!params.metadata.external) {
      await this.getHashesFromExternal(params)
      return
    }
    if (!params.metadata.traces) {
      await this.getHashesFromTraces(params)
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

  protected getNewMetadataForNewProcess(terminatedProcess: IngestionProcess): EvmNativeIngestionTaskMetadata {
    const metadata = terminatedProcess.metadata as EvmNativeIngestionTaskMetadata
    return {
      fromBlock: metadata.fromBlock,
      page: 1,
      pageSize: metadata.pageSize,
      traces: metadata.traces,
      external: metadata.external,
      saving: metadata.saving,
      tempBlock: metadata.tempBlock
    }
  }

  private async getHashesFromExternal(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: EvmNativeIngestionTaskMetadata
  }) {
    const { ingestionProcess, blockchainId, address, metadata } = params
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(blockchainId)
    const provider = this.ingestionDataProviderFactory.getProvider(params.blockchainId)

    const externals = await etherscanAdapter.getTransactionExternalsByAddress({
      address,
      fromBlock: metadata.tempBlock ?? metadata.fromBlock,
      page: metadata.page,
      offset: metadata.pageSize
    })

    if (!externals.length) {
      await this.next(ingestionProcess, {
        ...metadata,
        external: true,
        page: 1,
        tempBlock: null
      })
      return
    }

    for (const external of externals) {
      await provider.saveTransactionDetails({
        hash: external.hash,
        blockchainId: params.blockchainId,
        methodId: external.methodId,
        functionName: external.functionName
      })
    }

    await this.saveHashes({
      contractConfigurationId: null,
      blockchainId,
      address,
      data: externals.map((log) => ({
        transactionHash: log.hash,
        blockNumber: Number.parseInt(log.blockNumber)
      }))
    })

    const lastBlockNumber = Number.parseInt(externals[externals.length - 1].blockNumber)
    const paginationMetadata = await this.getEtherscanPaginationParams(metadata, lastBlockNumber)

    await this.next(ingestionProcess, {
      ...metadata,
      ...paginationMetadata
    })
  }

  private async getHashesFromTraces(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: EvmNativeIngestionTaskMetadata
  }) {
    const { ingestionProcess, blockchainId, address, metadata } = params
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(blockchainId)

    const traces = await etherscanAdapter.getTransactionInternalsByAddress({
      address,
      fromBlock: metadata.tempBlock ?? metadata.fromBlock,
      page: metadata.page,
      offset: metadata.pageSize
    })

    if (!traces.length) {
      await this.next(ingestionProcess, {
        ...metadata,
        traces: true,
        page: 1,
        tempBlock: null
      })
      return
    }

    await this.saveHashes({
      contractConfigurationId: null,
      blockchainId,
      address,
      data: traces.map((internal) => ({
        transactionHash: internal.hash,
        blockNumber: Number.parseInt(internal.blockNumber)
      }))
    })

    const lastBlockNumber = Number.parseInt(traces[traces.length - 1].blockNumber)
    const paginationMetadata = await this.getEtherscanPaginationParams(metadata, lastBlockNumber)

    await this.next(ingestionProcess, {
      ...metadata,
      ...paginationMetadata
    })
  }
}
