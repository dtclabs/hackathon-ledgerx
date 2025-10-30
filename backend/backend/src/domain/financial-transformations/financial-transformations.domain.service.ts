import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { setTimeout } from 'timers/promises'
import { TaskSyncType } from '../../core/events/event-types'
import { AdditionalTransformationPerWalletGroupTasksEntityService } from '../../shared/entity-services/additional-transformation-per-wallet-group-tasks/additional-transformation-per-wallet-group-tasks.entity-service'
import { AdditionalTransformationPerWalletTasksEntityService } from '../../shared/entity-services/additional-transformation-per-wallet-tasks/additional-transformation-per-wallet-tasks.entity-service'
import { BlockchainsEntityService } from '../../shared/entity-services/blockchains/blockchains.entity-service'
import { CoreTransformationTasksEntityService } from '../../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity-service'
import { FeatureFlagsEntityService } from '../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { PreprocessRawTasksEntityService } from '../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { WalletStatusesEnum } from '../../shared/entity-services/wallets/interfaces'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { FinancialTransformationsEventType } from './events/events'
import { IngestionsService } from './ingestions.service'
import { InvalidStateError } from '../../shared/errors/invalid-state.error'

@Injectable()
export class FinancialTransformationsDomainService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private coreTransformationTasksService: CoreTransformationTasksEntityService,
    private additionalTransformationPerWalletTasksService: AdditionalTransformationPerWalletTasksEntityService,
    private additionalTransformationPerWalletGroupTasksService: AdditionalTransformationPerWalletGroupTasksEntityService,
    private preprocessRawTasksService: PreprocessRawTasksEntityService,
    private ingestionService: IngestionsService,
    private walletsService: WalletsEntityService,
    private featureFlagsService: FeatureFlagsEntityService,
    private blockchainsService: BlockchainsEntityService,
    private logger: LoggerService
  ) {}

  async sync(params: { address: string; organizationId: string; syncType: TaskSyncType; blockchainIds: string[] }) {
    // Don't lowercase Solana addresses - they are case-sensitive
    const hasSolanaBlockchain = params.blockchainIds.some(id => id.includes('solana'))
    if (!hasSolanaBlockchain) {
      params.address = params.address.toLowerCase()
    }

    const enabledBlockchainIds = await this.blockchainsService.getEnabledIdsFrom(params.blockchainIds)

    for (const blockchainId of enabledBlockchainIds) {
      try {
        await this.walletsService.updateChainStatusByAddress(
          {
            organizationId: params.organizationId,
            address: params.address,
            blockchainIds: [blockchainId]
          },
          WalletStatusesEnum.SYNCING
        )

        const ingestionWorkflowId = await this.ingestionService.sync(params.address, blockchainId)

        const preprocessRawTask = await this.preprocessRawTasksService.getOrCreate({
          address: params.address,
          blockchainId: blockchainId,
          syncType: params.syncType,
          ingestionWorkflowId: ingestionWorkflowId ?? null
        })

        this.eventEmitter.emit(FinancialTransformationsEventType.PREPROCESS_RAW_SYNC_ADDRESS, preprocessRawTask.id)

        this.logger.info(
          `preprocessRawTaskId ${preprocessRawTask.id} emitted -----------------------------------------------`
        )

        const coreTransformationTask = await this.coreTransformationTasksService.getOrCreate({
          address: params.address,
          blockchainId: blockchainId,
          organizationId: params.organizationId,
          syncType: params.syncType,
          preprocessRawTaskId: preprocessRawTask?.id
        })

        this.eventEmitter.emit(
          FinancialTransformationsEventType.CORE_TRANSFORMATION_SYNC_ADDRESS,
          coreTransformationTask.id
        )

        this.logger.info(
          `coreTransformationTask ${coreTransformationTask.id} emitted -----------------------------------------------`
        )
      } catch (error) {
        if (error instanceof InvalidStateError) {
          this.logger.info(
            `ERROR: FinancialTransformationDomain Sync on blockchainId: ${blockchainId} not emitted because`,
            params,
            error
          )
        } else {
          this.logger.error(
            `ERROR: FinancialTransformationDomain Sync on blockchainId: ${blockchainId} not emitted because`,
            params,
            error
          )
        }
      }
    }
  }

  async additionalSync(params: {
    address: string
    organizationId: string
    syncType: TaskSyncType
    blockchainId: string
  }) {
    // Check if this is a Solana blockchain to preserve case-sensitivity
    const isSolanaBlockchain = params.blockchainId.includes('solana')
    
    const wallet = await this.walletsService.getByOrganizationIdAndAddress(
      params.organizationId,
      params.address,
      { walletGroup: true },
      { preserveCase: isSolanaBlockchain }
    )

    if (wallet) {
      const perWalletTask = await this.additionalTransformationPerWalletTasksService.getOrCreate({
        walletId: wallet.id,
        address: params.address,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        syncType: params.syncType
      })

      this.eventEmitter.emit(
        FinancialTransformationsEventType.ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET,
        perWalletTask.id
      )

      this.logger.info(
        `additionalTransformationPerWalletTask ${perWalletTask.id} is emitted. walletId: ${perWalletTask.walletId}, address: ${perWalletTask.address}`
      )

      const perWalletGroupTask = await this.additionalTransformationPerWalletGroupTasksService.createTaskIfNotExist({
        walletGroupId: wallet.walletGroup.id,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId,
        syncType: params.syncType
      })

      await setTimeout(1000)

      if (perWalletGroupTask) {
        this.eventEmitter.emit(
          FinancialTransformationsEventType.ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET_GROUP,
          perWalletGroupTask.id
        )

        this.logger.info(
          `additionalTransformationPerWalletGroupTask ${perWalletGroupTask.id} is emitted. walletGroupId: ${perWalletGroupTask.walletGroupId}`
        )
      }
    } else {
      this.logger.error('FinancialTransformationsDomain additionalSync failed because address is not a wallet', params)
    }
  }
}
