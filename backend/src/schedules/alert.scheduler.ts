import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { AdditionalTransformationPerWalletGroupTasksEntityService } from '../shared/entity-services/additional-transformation-per-wallet-group-tasks/additional-transformation-per-wallet-group-tasks.entity-service'
import { AdditionalTransformationPerWalletTasksEntityService } from '../shared/entity-services/additional-transformation-per-wallet-tasks/additional-transformation-per-wallet-tasks.entity-service'
import { CoreTransformationTasksEntityService } from '../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity-service'
import { PreprocessRawTasksEntityService } from '../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { LoggerService } from '../shared/logger/logger.service'

import Decimal from 'decimal.js'
import { AssetsDomainService } from '../assets/assets.domain.service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { IngestionWorkflowsEntityService } from '../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { WalletStatusesEnum } from '../shared/entity-services/wallets/interfaces'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'

@Injectable()
export class AlertScheduler {
  static WALLET_SYNCING_SET: Set<string> = new Set<string>()

  constructor(
    private logger: LoggerService,
    private ingestionWorkflowsEntityService: IngestionWorkflowsEntityService,
    private preprocessRawTasksService: PreprocessRawTasksEntityService,
    private coreTransformationTasksService: CoreTransformationTasksEntityService,
    private additionalTransformationPerWalletTasksService: AdditionalTransformationPerWalletTasksEntityService,
    private additionalTransformationPerWalletGroupTasksService: AdditionalTransformationPerWalletGroupTasksEntityService,
    private blockchainsEntityService: BlockchainsEntityService,
    private walletsService: WalletsEntityService,
    private assetsDomainService: AssetsDomainService
  ) {}

    // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('*/5 * * * *', { utcOffset: 0 })
  async syncIncomingWalletsAlert() {
    const stuckWallets = await this.walletsService.getAllSyncingForHoursWallets(4)

    for (const stuckWallet of stuckWallets) {
      if (!AlertScheduler.WALLET_SYNCING_SET.has(stuckWallet.id)) {
        AlertScheduler.WALLET_SYNCING_SET.add(stuckWallet.id)
        this.logger.error('Wallet stuck in syncing status', stuckWallet, {
          organizationId: stuckWallet.organization.id,
          walletId: stuckWallet.id
        })
      }
    }
  }

    // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('*/5 * * * *', { utcOffset: 0 })
  async syncOutgoingWalletsAlert() {
    const stuckIngestionTasks = await this.ingestionWorkflowsEntityService.getStuckForHoursTasks(4)

    for (const stuckIngestionTask of stuckIngestionTasks) {
      this.logger.error('Ingestion task stuck', stuckIngestionTask)
    }

    const stuckPreprocessTasks = await this.preprocessRawTasksService.getStuckForHoursTasks(4)

    for (const stuckPreprocessTask of stuckPreprocessTasks) {
      this.logger.error('Preprocess task stuck', stuckPreprocessTask)
    }

    const stuckCoreTasks = await this.coreTransformationTasksService.getStuckForHoursTasks(4)

    for (const stuckCoreTask of stuckCoreTasks) {
      this.logger.error('Core transformation task stuck', stuckCoreTask)
    }

    const stuckPerWalletTasks = await this.additionalTransformationPerWalletTasksService.getStuckForHoursTasks(4)

    for (const stuckPerWalletTask of stuckPerWalletTasks) {
      this.logger.error('Additional transformation per wallet Ttsk stuck', stuckPerWalletTask)
    }

    const stuckPerWalletGroupTasks =
      await this.additionalTransformationPerWalletGroupTasksService.getStuckForHoursTasks(4)

    for (const stuckPerWalletGroupTask of stuckPerWalletGroupTasks) {
      this.logger.error('Additional transformation per wallet group task stuck', stuckPerWalletGroupTask)
    }
  }

    // DISABLED EVM CRONJOB: // DISABLED EVM CRONJOB: @Cron('*/10 * * * *', { utcOffset: 0 })
  async syncOrganizationsAlert() {
    const recentlySyncedWallets = await this.walletsService.getSyncedWalletsWithinTheLastHours(12)

    const organizationIds: Set<string> = new Set<string>()
    for (const wallet of recentlySyncedWallets) {
      organizationIds.add(wallet.organization.id)
    }

    for (const organizationId of organizationIds) {
      const wallets = await this.walletsService.getAllByOrganizationId(organizationId)

      if (!wallets.every((wallet) => wallet.status === WalletStatusesEnum.SYNCED)) {
        continue
      }

      const blockchains = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
      for (const blockchain of blockchains) {
        const assetsOfOrganization = await this.assetsDomainService.getAssetsForOrganization(organizationId, [
          blockchain
        ])

        for (const asset of assetsOfOrganization) {
          const assetBalance = asset.totalUnits

          let walletBalance = new Decimal(0)

          const loggableWalletsWithAsset = []

          for (const wallet of wallets) {
            const tokenBalancesPerBlockchain = wallet.balance?.blockchains?.[blockchain]
            if (tokenBalancesPerBlockchain?.length) {
              for (const tokenBalance of tokenBalancesPerBlockchain) {
                if (tokenBalance.cryptocurrency.publicId === asset.cryptocurrency.publicId) {
                  walletBalance = Decimal.add(walletBalance, tokenBalance.cryptocurrencyAmount)
                  loggableWalletsWithAsset.push({
                    walletId: wallet.id,
                    walletAddress: wallet.address,
                    balance: tokenBalance.cryptocurrencyAmount
                  })
                }
              }
            }
          }

          if (walletBalance.comparedTo(assetBalance) !== 0) {
            const errorMessage = `Wallet has incorrect balance for cryptocurrency: ${asset.cryptocurrency.name} (${asset.cryptocurrency.symbol})`
            if (asset.cryptocurrency.isVerified) {
              this.logger.error(errorMessage, asset, { walletBalance: walletBalance }, loggableWalletsWithAsset, {
                organizationId
              })
            } else {
              this.logger.warning(errorMessage, asset, { walletBalance: walletBalance }, loggableWalletsWithAsset, {
                organizationId
              })
            }
          }
        }
      }
    }
  }
}
