import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { setTimeout } from 'timers/promises'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { AdditionalTransformationPerWalletGroupTasksEntityService } from '../../../shared/entity-services/additional-transformation-per-wallet-group-tasks/additional-transformation-per-wallet-group-tasks.entity-service'
import { AdditionalTransformationPerWalletTasksEntityService } from '../../../shared/entity-services/additional-transformation-per-wallet-tasks/additional-transformation-per-wallet-tasks.entity-service'
import { CoreTransformationTasksEntityService } from '../../../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity-service'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { WalletStatusesEnum } from '../../../shared/entity-services/wallets/interfaces'
import { WalletsEntityService } from '../../../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { LoggerService } from '../../../shared/logger/logger.service'
import { ChartOfAccountRulesEventTypes } from '../../chart-of-account-rules/listeners/interfaces'
import { AdditionalTransformationsPerWalletGroupDomainService } from '../additional-transformations-per-wallet-group.domain.service'
import { AdditionalTransformationsPerWalletDomainService } from '../additional-transformations-per-wallet.domain.service'
import {
  FinancialTransformationsEventType,
  PaymentsEventType,
  PaymentsSyncEvent,
  PayoutsEventType
} from '../events/events'
import { FeatureFlagOption } from '../../../shared/entity-services/feature-flags/interfaces'

@Injectable()
export class AdditionalTransformationsListener {
  constructor(
    private eventEmitter: EventEmitter2,
    private coreTransformationTasksService: CoreTransformationTasksEntityService,
    private additionalTransformationPerWalletTasksService: AdditionalTransformationPerWalletTasksEntityService,
    private additionalTransformationPerWalletGroupTasksService: AdditionalTransformationPerWalletGroupTasksEntityService,
    private additionalTransformationsPerWalletDomainService: AdditionalTransformationsPerWalletDomainService,
    private additionalTransformationsPerWalletGroupDomainService: AdditionalTransformationsPerWalletGroupDomainService,
    private walletsService: WalletsEntityService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService
  ) {}

  @OnEvent(FinancialTransformationsEventType.ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET, {
    async: true,
    promisify: true
  })
  async handleSyncPerWalletEvent(perWalletTaskId: string) {
    let task = await this.additionalTransformationPerWalletTasksService.get(perWalletTaskId)

    try {
      if (task.status !== TaskStatusEnum.COMPLETED) {
        await this.additionalTransformationPerWalletTasksService.changeStatus(task.id, TaskStatusEnum.RUNNING)

        await this.additionalTransformationsPerWalletDomainService.executeWorkflow(task)

        task = await this.additionalTransformationPerWalletTasksService.get(perWalletTaskId)

        if (task.status !== TaskStatusEnum.COMPLETED) {
          if (task.syncType === TaskSyncType.INCREMENTAL) {
            await setTimeout(1000)
          } else {
            await setTimeout(6000)
          }
          this.eventEmitter.emit(FinancialTransformationsEventType.ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET, task.id)
        } else {
          this.eventEmitter.emit(PayoutsEventType.PAYOUTS_SYNC, {
            walletId: task.walletId,
            blockchainId: task.blockchainId
          })
          this.eventEmitter.emit(ChartOfAccountRulesEventTypes.SYNC_UNMAPPED_FINANCIAL_TRANSACTIONS, {
            organizationId: task.organizationId
          })
          const { minutes, seconds } = dateHelper.getMinutesAndSecondsDifferenceFromTime(task.createdAt)
          this.logger.info(
            `additionalTransformationPerWalletTask ${perWalletTaskId} is COMPLETED after ${minutes} minutes and ${seconds} seconds`
          )
        }
      }
    } catch (e) {
      await this.additionalTransformationPerWalletTasksService.updateError(perWalletTaskId, e)
      this.logger.error(`additionalTransformationPerWalletTask ${perWalletTaskId} has errors`, e)
    }
  }

  @OnEvent(FinancialTransformationsEventType.ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET_GROUP, {
    async: true,
    promisify: true
  })
  async handleSyncPerWalletGroupEvent(perWalletGroupTaskId: string) {
    const serverDeploymentFlag = await this.featureFlagsService.isFeatureEnabled(FeatureFlagOption.SERVER_DEPLOYMENT)
    if (!serverDeploymentFlag) {
      let task = await this.additionalTransformationPerWalletGroupTasksService.get(perWalletGroupTaskId)

      try {
        if (task.status !== TaskStatusEnum.COMPLETED) {
          await this.additionalTransformationPerWalletGroupTasksService.changeStatus(task.id, TaskStatusEnum.RUNNING)

          const wallets = await this.walletsService.getAllByOrganizationIdAndWalletGroupId(
            task.organizationId,
            task.walletGroupId,
            { walletGroup: true }
          )

          // Make sure the status of the sync of all the wallet in the wallet groups are completed up to this step
          let toExecuteFlag = true
          for (const wallet of wallets) {
            const runningAdditionalTransformationPerWalletTask =
              await this.additionalTransformationPerWalletTasksService.getCurrentTaskByWalletAndBlockchainAndOrganization(
                { walletId: wallet.id, blockchainId: task.blockchainId, organizationId: task.organizationId }
              )

            if (runningAdditionalTransformationPerWalletTask) {
              toExecuteFlag = false
              break
            }

            const runningCoreTask =
              await this.coreTransformationTasksService.getCurrentTaskByAddressAndBlockchainAndOrganization({
                address: wallet.address,
                blockchainId: task.blockchainId,
                organizationId: task.organizationId
              })

            if (runningCoreTask) {
              toExecuteFlag = false
              break
            }
          }

          if (toExecuteFlag) {
            await this.additionalTransformationPerWalletGroupTasksService.changeStatus(task.id, TaskStatusEnum.RUNNING)
            await this.additionalTransformationsPerWalletGroupDomainService.executeWorkflow(task)
            task = await this.additionalTransformationPerWalletGroupTasksService.get(perWalletGroupTaskId)
          }

          if (task.status !== TaskStatusEnum.COMPLETED) {
            if (task.syncType === TaskSyncType.INCREMENTAL) {
              await setTimeout(1000)
            } else {
              await setTimeout(4000)
            }
            this.eventEmitter.emit(
              FinancialTransformationsEventType.ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET_GROUP,
              task.id
            )
          } else {
            for (const wallet of wallets) {
              await this.walletsService.updateChainStatusByAddress(
                {
                  blockchainIds: [task.blockchainId],
                  organizationId: task.organizationId,
                  address: wallet.address
                },
                WalletStatusesEnum.SYNCED
              )
            }

            this.eventEmitter.emit(
              PaymentsEventType.PAYMENTS_SYNC,
              new PaymentsSyncEvent(task.walletGroupId, task.blockchainId, task.organizationId)
            )

            const { minutes, seconds } = dateHelper.getMinutesAndSecondsDifferenceFromTime(task.createdAt)
            this.logger.info(
              `additionalTransformationPerWalletGroupTask ${perWalletGroupTaskId} is COMPLETED after ${minutes} minutes and ${seconds} seconds`
            )
          }
        }
      } catch (e) {
        await this.additionalTransformationPerWalletGroupTasksService.updateError(perWalletGroupTaskId, e)
        this.logger.error(`additionalTransformationPerWalletGroupTask ${perWalletGroupTaskId} has errors`, e)
      }
    }
  }
}
