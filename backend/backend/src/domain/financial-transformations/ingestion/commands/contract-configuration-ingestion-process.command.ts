import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { hexToNumber } from 'web3-utils'
import { BlockchainsEntityService } from '../../../../shared/entity-services/blockchains/blockchains.entity-service'
import { EvmLog } from '../../../../shared/entity-services/evm-logs/evm-log.entity'
import { EvmLogsEntityService } from '../../../../shared/entity-services/evm-logs/evm-logs.entity.service'
import { IngestionProcess } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { EtherscanIngestionTaskMetadata } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { WalletContractConfigurationLog } from '../../../../shared/entity-services/wallet-contract-configuration-logs/wallet-contract-configuration-log.entity'
import { WalletContractConfigurationLogsEntityService } from '../../../../shared/entity-services/wallet-contract-configuration-logs/wallet-contract-configuration-logs.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { ingestionUtils } from '../ingestion.utils'
import { IngestionProcessCommand } from './ingestion-process.command'

@Injectable()
export class ContractConfigurationIngestionProcessCommand extends IngestionProcessCommand<EtherscanIngestionTaskMetadata> {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    protected readonly blockchainsService: BlockchainsEntityService,
    protected readonly configService: ConfigService,
    protected readonly evmLogsEntityService: EvmLogsEntityService,
    protected readonly walletContractConfigurationLogsEntityService: WalletContractConfigurationLogsEntityService,
    protected readonly ingestionProcessEntityService: IngestionProcessEntityService,
    protected readonly logger: LoggerService
  ) {
    super(eventEmitter, ingestionProcessEntityService, logger)
  }

  async pullAndSaveData(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: EtherscanIngestionTaskMetadata
  }): Promise<void> {
    const { ingestionProcess, blockchainId, address, metadata } = params
    const contractConfiguration = ingestionProcess.contractConfiguration

    if (!contractConfiguration) {
      this.logger.error(`Contract configuration is not set for process ${ingestionProcess.id}`, ingestionProcess)
      return
    }
    const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(blockchainId)
    const alchemyAdapter = this.blockExplorerAdapterFactory.getAlchemyAdapter(blockchainId)

    const logs = await etherscanAdapter.getLogs({
      contractAddress: contractConfiguration.contractAddress,
      topic0: contractConfiguration.topic0,
      topic1: ingestionUtils.isAddressTopic(contractConfiguration.topic1) ? address : null,
      topic2: ingestionUtils.isAddressTopic(contractConfiguration.topic2) ? address : null,
      topic3: ingestionUtils.isAddressTopic(contractConfiguration.topic3) ? address : null,
      fromBlock: metadata.fromBlock,
      page: metadata.page,
      offset: metadata.pageSize
    })

    if (!logs.length) {
      await this.complete(ingestionProcess)
      return
    }

    for (const log of logs) {
      if (
        !ingestionUtils.isLogMatchConfiguration({
          contractConfiguration,
          logTopic0: log.topics?.[0],
          logTopic1: log.topics?.[1],
          logTopic2: log.topics?.[2],
          logTopic3: log.topics?.[3]
        })
      ) {
        continue
      }

      const [block, transactionReceipt] = await Promise.all([
        etherscanAdapter.getBlockByNumber(Number(hexToNumber(log.blockNumber))),
        alchemyAdapter.getTransactionReceipt(log.transactionHash)
      ])

      const evmLog = EvmLog.create({
        contractAddress: log.address,
        blockHash: log.blockHash,
        blockNumber: log.blockNumber,
        blockTimestamp: block.timeStamp,
        blockchainId,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        topic0: log.topics?.[0] ?? null,
        topic1: log.topics?.[1] ?? null,
        topic2: log.topics?.[2] ?? null,
        topic3: log.topics?.[3] ?? null,
        data: log.data,
        initiatorAddress: transactionReceipt.from
      })
      const createdEvmLog = await this.evmLogsEntityService.upsert(evmLog)
      const walletContractConfigurationLog = WalletContractConfigurationLog.create({
        evmLog: createdEvmLog,
        address,
        contractConfiguration
      })
      await this.walletContractConfigurationLogsEntityService.upsert(walletContractConfigurationLog)
    }
    await this.next(ingestionProcess, {
      ...metadata,
      page: metadata.page + 1
    })
  }

  protected getNewMetadataForNewProcess(terminatedProcess: IngestionProcess): EtherscanIngestionTaskMetadata {
    const metadata = terminatedProcess.metadata as EtherscanIngestionTaskMetadata
    return {
      fromBlock: metadata.fromBlock,
      page: 1,
      pageSize: metadata.pageSize
    }
  }
}
