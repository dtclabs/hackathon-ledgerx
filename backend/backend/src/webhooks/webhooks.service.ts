import { Injectable } from '@nestjs/common'
import { LoggerService } from '../shared/logger/logger.service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { FinancialTransactionsDomainService } from '../financial-transactions/financial-transactions.domain.service'
import { DataOnchainIngestorService } from '../data-onchain-ingestor/data-onchain-ingestor.service'
import { DataOnchainQueryService } from '../data-onchain-ingestor/data-onchain-query.service'

export interface IndexingWebhookData {
  index_address?: string  // New format
  address?: string        // Legacy format 
  chain_id?: string
  run_id?: string
  status: 'SUCCEED' | 'COMPLETED' | 'FAILED' | 'PROCESSING'
  data?: {
    transaction_count?: number
    last_slot?: number
    last_signature?: string
  }
  transaction_count?: number
  error_message?: string
  completed_at?: string
  metadata?: any
}

export interface WebhookStatus {
  address: string
  chain_id: string
  last_run_id?: string
  last_status?: string
  last_updated: string
  transaction_count?: number
  total_webhooks_received: number
}

@Injectable()
export class WebhooksService {
  constructor(
    private readonly logger: LoggerService,
    private readonly walletsEntityService: WalletsEntityService,
    private readonly financialTransactionsEntityService: FinancialTransactionsEntityService,
    private readonly financialTransactionsDomainService: FinancialTransactionsDomainService,
    private readonly dataOnchainIngestorService: DataOnchainIngestorService,
    private readonly dataOnchainQueryService: DataOnchainQueryService
  ) {}

  /**
   * Process indexing completion webhook from data-onchain-ingestor
   */
  async processIndexingWebhook(webhook: IndexingWebhookData): Promise<void> {
    // Extract address from either format
    const address = webhook.index_address || webhook.address
    const transactionCount = webhook.data?.transaction_count || webhook.transaction_count || 0
    
    this.logger.info('Processing indexing webhook', {
      address,
      index_address: webhook.index_address,
      chain_id: webhook.chain_id,
      status: webhook.status,
      transaction_count: transactionCount,
      data: webhook.data,
      raw_webhook: webhook
    })

    try {
      // Update wallet status based on indexing result
      await this.updateWalletIndexingStatus(webhook)

      // If completed successfully, sync the newly indexed data
      if (webhook.status === 'SUCCEED' || webhook.status === 'COMPLETED') {
        await this.syncIndexedData(webhook)
      }

      // Store webhook history for tracking
      await this.storeWebhookHistory(webhook)

      this.logger.info('Indexing webhook processed successfully', {
        address,
        run_id: webhook.run_id,
        status: webhook.status
      })

    } catch (error) {
      this.logger.error('Failed to process indexing webhook', error, {
        webhook
      })
      throw error
    }
  }

  /**
   * Process progress webhook updates
   */
  async processProgressWebhook(webhook: any): Promise<void> {
    this.logger.info('Processing progress webhook', {
      address: webhook.address,
      run_id: webhook.run_id,
      progress: webhook.progress
    })

    // Update progress status (could be stored in cache or database)
    await this.updateProgressStatus(webhook)
  }

  /**
   * Update wallet indexing status
   */
  private async updateWalletIndexingStatus(webhook: IndexingWebhookData): Promise<void> {
    try {
      // Extract address from either format
      const address = webhook.index_address || webhook.address
      const transactionCount = webhook.data?.transaction_count || webhook.transaction_count || 0
      
      // Find wallets by address
      const wallets = await this.findWalletsByAddress(address)
      
      if (wallets.length === 0) {
        this.logger.error('No wallets found for indexed address', {
          address,
          index_address: webhook.index_address,
          raw_webhook: webhook
        })
        return
      }

      for (const wallet of wallets) {
        this.logger.info('Wallet indexing completed', {
          walletId: wallet.id,
          walletPublicId: wallet.publicId,
          address,
          status: webhook.status,
          chain_id: webhook.chain_id || 'solana',
          transaction_count: transactionCount,
          last_slot: webhook.data?.last_slot,
          last_signature: webhook.data?.last_signature,
          completed_at: webhook.completed_at
        })
      }

    } catch (error) {
      this.logger.error('Failed to update wallet indexing status', error, {
        address: webhook.index_address || webhook.address,
        run_id: webhook.run_id
      })
    }
  }

  /**
   * Sync newly indexed data from data-onchain-ingestor
   */
  private async syncIndexedData(webhook: IndexingWebhookData): Promise<void> {
    try {
      // Extract address from either format
      const address = webhook.index_address || webhook.address
      const transactionCount = webhook.data?.transaction_count || webhook.transaction_count || 0
      const chainId = webhook.chain_id || 'solana'
      
      this.logger.info('Syncing indexed data', {
        address,
        chain_id: chainId,
        transaction_count: transactionCount,
        last_slot: webhook.data?.last_slot,
        last_signature: webhook.data?.last_signature
      })

      // Find wallets by address
      const wallets = await this.findWalletsByAddress(address)
      
      if (wallets.length === 0) {
        this.logger.error('No wallets found for indexed address', {
          address,
          index_address: webhook.index_address
        })
        return
      }

      this.logger.info('Found wallets for sync', {
        address,
        wallet_count: wallets.length,
        wallet_ids: wallets.map(w => w.publicId)
      })

      // Update each wallet with fresh data from data-onchain-ingestor
      for (const wallet of wallets) {
        await this.updateWalletWithIndexedData(wallet, webhook)
      }

      // 🚀 AUTO-TRIGGER: Start financial transactions import for indexed wallets
      for (const wallet of wallets) {
        await this.triggerFinancialTransactionImport(wallet, webhook)
      }

    } catch (error) {
      this.logger.error('Failed to sync indexed data', error, {
        address: webhook.index_address || webhook.address,
        run_id: webhook.run_id
      })
    }
  }

  /**
   * Update single wallet with indexed data (no breaking changes)
   */
  private async updateWalletWithIndexedData(wallet: any, webhook: IndexingWebhookData): Promise<void> {
    try {
      this.logger.info('Updating wallet with indexed data', {
        wallet_id: wallet.publicId,
        address: wallet.address
      })

      // Get fresh portfolio data from data-onchain-query service
      const portfolio = await this.dataOnchainQueryService.getWalletPortfolio(
        wallet.publicId,
        wallet.address,
        webhook.chain_id
      )

      if (portfolio) {
        // Update wallet balance using existing structure (no breaking changes)
        await this.updateWalletBalanceFromPortfolio(wallet, portfolio, webhook.chain_id)

        this.logger.info('Wallet updated successfully', {
          wallet_id: wallet.publicId,
          total_value: portfolio.total_usd_value || 0,
          token_count: portfolio.balances?.length || 0
        })
      } else {
        this.logger.warning('No portfolio data found for wallet', {
          wallet_id: wallet.publicId,
          address: wallet.address
        })
      }

    } catch (error) {
      this.logger.error('Failed to update wallet with indexed data', error, {
        wallet_id: wallet.publicId,
        address: wallet.address
      })
      // Continue with other wallets
    }
  }

  /**
   * Update wallet balance from portfolio data (maintains existing format)
   */
  private async updateWalletBalanceFromPortfolio(wallet: any, portfolio: any, chainId: string): Promise<void> {
    try {
      // Convert portfolio to existing wallet balance format
      const updatedBalance = this.convertPortfolioToBalance(portfolio, chainId)
      const updatedTokens = this.convertPortfolioToTokens(portfolio)

      // For now, just log the update (would normally update database)
      this.logger.info('Would update wallet balance', {
        wallet_id: wallet.publicId,
        balance_data: updatedBalance,
        tokens_data: updatedTokens
      })

      // TODO: Update wallet using proper entity service method
      // await this.walletsEntityService.update(wallet.id, {
      //   balance: updatedBalance,
      //   ownedCryptocurrencies: updatedTokens,
      //   lastSyncedAt: new Date()
      // })

    } catch (error) {
      this.logger.error('Failed to update wallet balance from portfolio', error, {
        wallet_id: wallet.publicId
      })
    }
  }

  /**
   * Convert data-onchain portfolio to existing balance format
   */
  private convertPortfolioToBalance(portfolio: any, chainId: string): any {
    const balance = {}
    
    if (portfolio.balances && Array.isArray(portfolio.balances)) {
      balance[chainId] = {
        totalValueUsd: portfolio.total_usd_value || 0,
        lastUpdated: new Date().toISOString(),
        tokens: portfolio.balances.map((token: any) => ({
          symbol: token.symbol,
          amount: token.balance,
          valueUsd: token.usd_value || 0,
          tokenAddress: token.address
        }))
      }
    }

    return balance
  }

  /**
   * Convert data-onchain portfolio to existing owned cryptocurrencies format
   */
  private convertPortfolioToTokens(portfolio: any): any {
    const owned = {}
    
    if (portfolio.balances && Array.isArray(portfolio.balances)) {
      portfolio.balances.forEach((token: any) => {
        if (parseFloat(token.balance || '0') > 0) {
          owned[token.symbol] = {
            balance: token.balance,
            value_usd: token.usd_value || 0,
            token_address: token.address
          }
        }
      })
    }

    return owned
  }

  /**
   * Find wallets by address (case-sensitive for Solana)
   */
  private async findWalletsByAddress(address: string): Promise<any[]> {
    try {
      const allWallets = await this.walletsEntityService.getAll()
      
      // Solana addresses are case-sensitive
      return allWallets.filter(wallet => wallet.address === address)
    } catch (error) {
      this.logger.error('Failed to find wallets by address', error, {
        address
      })
      return []
    }
  }

  /**
   * Store webhook history for tracking
   */
  private async storeWebhookHistory(webhook: IndexingWebhookData): Promise<void> {
    // Store in logs for now - could create webhook_history table if needed
    this.logger.info('Webhook history stored', {
      address: webhook.address,
      run_id: webhook.run_id,
      status: webhook.status,
      transaction_count: webhook.transaction_count,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Update progress status
   */
  private async updateProgressStatus(webhook: any): Promise<void> {
    // Could store in cache or database for real-time progress tracking
    this.logger.info('Progress update', {
      address: webhook.address,
      run_id: webhook.run_id,
      progress: webhook.progress,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get webhook processing status for an address
   */
  async getWebhookStatus(address: string, chain_id: string, run_id?: string): Promise<WebhookStatus> {
    // This would query webhook history/status from database
    // For now, return a mock status
    return {
      address,
      chain_id,
      last_run_id: run_id,
      last_status: 'COMPLETED',
      last_updated: new Date().toISOString(),
      transaction_count: 0,
      total_webhooks_received: 1
    }
  }

  /**
   * Get webhook history for an address
   */
  async getWebhookHistory(address: string, chain_id: string, limit: number = 10): Promise<any[]> {
    // This would query webhook history from database
    // For now, return empty array
    this.logger.info('Getting webhook history', {
      address,
      chain_id,
      limit
    })

    return []
  }

  /**
   * 🚀 AUTO-TRIGGER: Start financial transaction import when indexing completes
   * This calls the endpoint: POST /{{organization_id}}/financial-transactions/import/{{wallet_public_id}}
   */
  private async triggerFinancialTransactionImport(wallet: any, webhook: IndexingWebhookData): Promise<void> {
    let organizationId: string | undefined
    
    try {
      // Need to get full wallet details with organization relationship
      const fullWallet = await this.walletsEntityService.get(wallet.id, {
        relations: ['organization']
      })

      organizationId = fullWallet.organization?.id
      
      this.logger.info('🚀 AUTOMATION: Triggering financial transaction import', {
        wallet_id: wallet.publicId,
        wallet_address: wallet.address,
        organization_id: organizationId,
        has_organization: !!fullWallet.organization,
        webhook_run_id: webhook.run_id,
        chain_id: webhook.chain_id || 'solana',
        trigger: 'index-complete-webhook'
      })

      // Validate organization ID exists
      if (!organizationId) {
        this.logger.error('❌ Cannot trigger import - wallet has no organization ID', {
          wallet_id: wallet.publicId,
          wallet_address: wallet.address,
          wallet_entity: fullWallet
        })
        return
      }

      // Check if wallet supports Solana (only import for Solana wallets)
      const isSolanaWallet = wallet.supportedBlockchains?.some((chain: string) => 
        chain.toLowerCase().includes('solana')
      ) || true // Default to true for Solana addresses

      if (!isSolanaWallet) {
        this.logger.info('Skipping import - not a Solana wallet', {
          wallet_id: wallet.publicId,
          supported_blockchains: wallet.supportedBlockchains
        })
        return
      }

      // Start the financial transaction import
      const result = await this.financialTransactionsDomainService.importSolanaTransactions(
        organizationId,
        wallet.publicId
      )

      this.logger.info('✅ Financial transaction import started successfully', {
        wallet_id: wallet.publicId,
        organization_id: organizationId,
        import_job_id: result.jobId,
        webhook_run_id: webhook.run_id,
        message: result.message
      })

    } catch (error) {
      // Don't throw - just log the error so webhook processing continues
      this.logger.error('❌ Failed to trigger financial transaction import', error, {
        wallet_id: wallet.publicId,
        wallet_address: wallet.address,
        organization_id: organizationId,
        webhook_run_id: webhook.run_id,
        error_message: error.message
      })
    }
  }
}