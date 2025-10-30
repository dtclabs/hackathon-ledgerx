import { Injectable } from '@nestjs/common'
import { IngestionProcess } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { EvmBlockRewardMetadata } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { BlockchainsEntityService } from '../../../../shared/entity-services/blockchains/blockchains.entity-service'
import { ConfigService } from '@nestjs/config'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../data-providers/ingestion-data-provider.factory'
import { IngestionProcessCommand } from './ingestion-process.command'
import { dateHelper } from '../../../../shared/helpers/date.helper'

@Injectable()
export class EvmBlockRewardProcessCommand extends IngestionProcessCommand<EvmBlockRewardMetadata> {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    protected readonly ingestionDataProviderFactory: IngestionDataProviderFactory,
    protected readonly blockchainsService: BlockchainsEntityService,
    protected readonly configService: ConfigService,
    protected readonly ingestionProcessEntityService: IngestionProcessEntityService,
    protected readonly logger: LoggerService
  ) {
    super(eventEmitter, ingestionProcessEntityService, logger)
  }

  async pullAndSaveData(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: EvmBlockRewardMetadata
  }): Promise<void> {
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(params.blockchainId)
    const etherscanBlockRewards = await etherscanAdapter.getBlockRewards({
      address: params.address,
      page: params.metadata.page,
      offset: params.metadata.pageSize
    })
    if (!etherscanBlockRewards.length) {
      await this.complete(params.ingestionProcess)
      return
    }

    const dataProviderService = this.ingestionDataProviderFactory.getProvider(params.blockchainId)

    for (const etherscanBlockReward of etherscanBlockRewards) {
      const blockNumber = Number.parseInt(etherscanBlockReward.blockNumber)
      const blockTimestamp = dateHelper.fromUnixTimestampToDate(Number.parseInt(etherscanBlockReward.timeStamp))
      if (blockNumber <= params.metadata.lastBlock) {
        break
      }
      await dataProviderService.saveBlockReward({
        blockNumber: blockNumber,
        blockReward: etherscanBlockReward.blockReward,
        blockchainId: params.blockchainId,
        validatedByAddress: params.address,
        blockTimestamp: blockTimestamp.toISOString()
      })
    }

    await this.next(params.ingestionProcess, {
      ...params.metadata,
      page: params.metadata.page + 1
    })
  }

  protected getNewMetadataForNewProcess(terminatedProcess: IngestionProcess): EvmBlockRewardMetadata {
    const metadata = terminatedProcess.metadata as EvmBlockRewardMetadata
    return {
      lastBlock: metadata.lastBlock,
      page: 1,
      pageSize: metadata.pageSize
    }
  }
}
