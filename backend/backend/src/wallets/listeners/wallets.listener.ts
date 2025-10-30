import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { WalletsTransformationsDomainService } from '../../domain/financial-transformations/wallets-transformations.domain.service'
import { FeatureFlagsEntityService } from '../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { WalletEventTypesEnum } from '../events/event-types'
import {
  WalletBalanceSyncPerWalletEventParams,
  WalletCreatedEvent,
  WalletDeletedEvent,
  WalletSyncBalanceFromChainsEventParams,
  WalletUpdatedEvent
} from '../events/events'
import { WalletsDomainService } from '../wallets.domain.service'
import { PaymentsDomainService } from '../../payments/payments.domain.service'
import { DataOnchainIngestorService } from '../../data-onchain-ingestor/data-onchain-ingestor.service'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'

@Injectable()
export class WalletsListener {
  constructor(
    private logger: LoggerService,
    private walletsDomainService: WalletsDomainService,
    private paymentsDomainService: PaymentsDomainService,
    private featureFlagsService: FeatureFlagsEntityService,
    private walletsTransformationsDomainService: WalletsTransformationsDomainService,
    private configService: ConfigService,
    private dataOnchainIngestorService: DataOnchainIngestorService,
    private walletsEntityService: WalletsEntityService
  ) {}

  @OnEvent(WalletEventTypesEnum.WALLET_SYNC_BALANCE_PER_WALLET, { async: true, promisify: true })
  async handleSyncBalancePerWalletEvent(event: WalletBalanceSyncPerWalletEventParams) {
    try {
      this.logger.info(`WALLET_SYNC_BALANCE_PER_WALLET is running for wallet ${event?.walletId}`, { event })
      await this.walletsTransformationsDomainService.syncBalance(event.walletId)
    } catch (e) {
      this.logger.error(`WALLET_SYNC_BALANCE_PER_WALLET failed for wallet ${event?.walletId}: ${e.message}`, e, {
        event
      })
    }
  }

  @OnEvent(WalletEventTypesEnum.WALLET_SYNC_BALANCE_FROM_CHAINS_PER_WALLET_GROUP, { async: true, promisify: true })
  async handleSyncBalanceFromChainsPerWalletGroupEvent(event: WalletSyncBalanceFromChainsEventParams) {
    try {
      this.logger.info(
        `WALLET_SYNC_BALANCE_FROM_CHAINS_PER_WALLET_GROUP is running for groupId: ${event?.params.walletGroupId} and blockchain ${event?.params.blockchainId}`,
        { event }
      )
      await this.walletsTransformationsDomainService.syncBalanceFromChainForWalletGroup(
        event.params.walletGroupId,
        event.params.blockchainId
      )
    } catch (e) {
      this.logger.error(
        `WALLET_SYNC_BALANCE_FROM_CHAINS_PER_WALLET_GROUP failed for groupId: ${event?.params.walletGroupId} and blockchain ${event?.params.blockchainId}: ${e.message}`,
        e,
        {
          event
        }
      )
    }
  }

  @OnEvent(WalletEventTypesEnum.WALLET_CREATED, { async: true, promisify: true })
  async handleWalletCreation(event: WalletCreatedEvent) {
    this.logger.info(`WALLET_CREATED for ${event.walletId}`, { event })
    
    try {
      // Existing payment sync logic
      await this.paymentsDomainService.syncDestinationMetadataByWallet(event.walletId)
    } catch (e) {
      this.logger.error(`Failed to sync payment destination metadata for wallet ${event.walletId}: ${e.message}`, e, {
        organizationId: event.organizationId,
        event
      })
    }

    // 🚀 NEW: Auto-trigger SOL indexing for Solana wallets
    try {
      // Get wallet details (supportedBlockchains is JSON column, not relation)
      const wallet = await this.walletsEntityService.get(event.walletId)
      
      this.logger.info(`Checking wallet for SOL indexing trigger`, {
        walletId: event.walletId,
        address: wallet.address,
        supportedBlockchains: wallet.supportedBlockchains,
        sourceType: wallet.sourceType
      })

      // Check if wallet supports Solana
      if (wallet.supportedBlockchains && wallet.supportedBlockchains.includes('solana')) {
        this.logger.info(`🎯 SOL: Triggering automatic Solana indexing for new wallet`, {
          walletId: event.walletId,
          address: wallet.address,
          organizationId: event.organizationId
        })

        const webhookUrl = `${this.configService.get('BASE_URL')}/api/v1/webhooks/indexing-complete`
        
        const indexingResult = await this.dataOnchainIngestorService.triggerSolanaIndexing({
          address: wallet.address,
          chain_id: 'solana',
          sync_mode: 'HISTORICAL', // First import = full history
          webhook_url: webhookUrl
        })

        this.logger.info(`✅ SOL indexing workflow triggered successfully for new wallet`, {
          walletId: event.walletId,
          address: wallet.address,
          workflowId: indexingResult.workflow_id,
          runId: indexingResult.run_id,
          estimatedCompletion: indexingResult.estimated_completion_time
        })
      } else {
        this.logger.info(`Wallet does not support Solana - skipping SOL indexing`, {
          walletId: event.walletId,
          address: wallet.address,
          supportedBlockchains: wallet.supportedBlockchains
        })
      }
    } catch (error) {
      this.logger.error(`❌ Failed to trigger SOL indexing for new wallet ${event.walletId}`, error, {
        walletId: event.walletId,
        organizationId: event.organizationId,
        errorMessage: error.message
      })
      // Don't fail wallet creation if indexing fails - this is a background process
    }
  }

  @OnEvent(WalletEventTypesEnum.WALLET_UPDATED, { async: true, promisify: true })
  async handleWalletUpdate(event: WalletUpdatedEvent) {
    this.logger.info(`WALLET_UPDATED for ${event.walletId}`, { event })
    try {
      await this.paymentsDomainService.syncDestinationMetadataByWallet(event.walletId)
    } catch (e) {
      this.logger.error(`Failed to sync payment destination metadata for wallet ${event.walletId}: ${e.message}`, e, {
        organizationId: event.organizationId,
        event
      })
    }
  }

  @OnEvent(WalletEventTypesEnum.WALLET_DELETED, { async: true, promisify: true })
  async handleWalletDeletion(event: WalletDeletedEvent) {
    this.logger.info(`WALLET_DELETED for ${event.walletId}`, { event })
    try {
      await this.paymentsDomainService.syncDestinationMetadataByWallet(event.walletId)
    } catch (e) {
      this.logger.error(`Failed to sync payment destination metadata for wallet ${event.walletId}: ${e.message}`, e, {
        organizationId: event.organizationId,
        event
      })
    }
  }

  // @OnEvent(EventTypesEnum.WALLET_SYNC_CHANGE_STATUS, { async: true, promisify: true })
  // async handleWalletChangeStatus(event: WalletChangeSyncStatusEvent) {
  //   try {
  //     this.logger.log(
  //       `Sync wallet balance for wallet address ${event?.payload.address} and organization ${event.payload.address}`,
  //       { event: event.payload }
  //     )
  //     await this.walletDomainService.changeStatus(event.payload)
  //   } catch (e) {
  //     this.logger.error(
  //       `Can't update wallet sync status ${event?.payload.address} and organization ${event.payload.address}: ${e.message}`,
  //       e,
  //       {
  //         event
  //       }
  //     )
  //   }
  // }
}
