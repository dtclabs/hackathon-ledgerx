import { Injectable } from '@nestjs/common'
import { LoggerService } from '../shared/logger/logger.service'
import { DataOnchainQueryService } from '../data-onchain-ingestor/data-onchain-query.service'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import {
  CreateFinancialTransactionChildDto,
  CreateFinancialTransactionParentDto,
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataType,
  FinancialTransactionChildMetadataStatus,
  FinancialTransactionParentStatus,
  FinancialTransactionParentActivity,
  GainLossInclusionStatus
} from '../shared/entity-services/financial-transactions/interfaces'
import { FinancialTransaction } from '../data-onchain-ingestor/interfaces'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'

/**
 * Service to import Solana transactions from data-onchain-ingestor into financial_transactions domain
 * Following the same pattern as EVM financial transactions processing
 */
@Injectable()
export class SolanaFinancialTransactionsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly dataOnchainQueryService: DataOnchainQueryService,
    private readonly financialTransactionsService: FinancialTransactionsEntityService,
    private readonly walletsService: WalletsEntityService,
    private readonly cryptocurrenciesService: CryptocurrenciesEntityService,
    private readonly blockchainsService: BlockchainsEntityService
  ) {}

  /**
   * Import Solana transactions from data-onchain-ingestor into financial_transactions tables
   * Same approach as EVM transactions but for Solana data
   */
  async importSolanaTransactions(organizationId: string, walletPublicId: string): Promise<void> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    this.logger.info('Importing Solana transactions to financial_transactions domain', {
      walletId: wallet.id,
      address: wallet.address
    })

    // Get transactions from data-onchain-ingestor
    const transactions = await this.dataOnchainQueryService.getTransactions(
      wallet.address,
      'solana',
      { limit: 1000, offset: 0, exclude_wsol: true }
    )

    this.logger.info('Retrieved transactions from data-onchain-ingestor', {
      count: transactions.length,
      walletAddress: wallet.address
    })

    // Group transactions by hash
    const transactionGroups = this.groupTransactionsByHash(transactions)

    for (const [hash, groupedTransactions] of transactionGroups) {
      await this.processTransactionGroup(organizationId, hash, groupedTransactions)
    }

    this.logger.info('Solana transactions imported successfully', {
      organizationId,
      walletPublicId,
      transactionsProcessed: transactions.length
    })
  }

  private groupTransactionsByHash(transactions: FinancialTransaction[]): Map<string, FinancialTransaction[]> {
    const groups = new Map<string, FinancialTransaction[]>()

    for (const transaction of transactions) {
      if (!groups.has(transaction.hash)) {
        groups.set(transaction.hash, [])
      }
      groups.get(transaction.hash)!.push(transaction)
    }

    return groups
  }

  private async processTransactionGroup(
    organizationId: string,
    hash: string,
    transactions: FinancialTransaction[]
  ): Promise<void> {
    // createOrUpdateParent will handle duplicates automatically

    // Get Solana blockchain - assuming 'solana' is the publicId
    const blockchain = await this.blockchainsService.getByPublicId('solana')
    if (!blockchain) {
      throw new Error('Solana blockchain not configured in system')
    }

    // Create parent transaction following EVM pattern
    const parentDto: CreateFinancialTransactionParentDto = {
      hash,
      blockchainId: blockchain.id,
      activity: this.determineActivity(transactions),
      status: FinancialTransactionParentStatus.ACTIVE,
      organizationId,
      valueTimestamp: new Date((transactions[0].timestamp || 0) * 1000)
    }

    this.logger.info('Creating financial transaction parent', {
      hash,
      activity: parentDto.activity,
      transactionCount: transactions.length,
      firstTxTimestamp: transactions[0].timestamp
    })

    const parentTransaction = await this.financialTransactionsService.createOrUpdateParent(parentDto)

    // Create child transactions for each token movement
    for (const transaction of transactions) {
      await this.createChildTransaction(organizationId, parentTransaction, transaction, blockchain.id)
    }
  }

  private async createChildTransaction(
    organizationId: string,
    parentTransaction: any,
    transaction: FinancialTransaction,
    blockchainId: string
  ): Promise<void> {
    // Get or find cryptocurrency
    const cryptocurrency = await this.getCryptocurrency(transaction.symbol, transaction.address)
    if (!cryptocurrency) {
      this.logger.error('Cryptocurrency not found, skipping transaction', {
        symbol: transaction.symbol,
        address: transaction.address,
        hash: transaction.hash
      })
      return
    }

    // Determine transaction type and direction following EVM pattern
    const { type, direction } = this.determineTypeAndDirection(transaction)

    const childDto: CreateFinancialTransactionChildDto = {
      publicId: `${transaction.hash}-${transaction.symbol}-${transaction.transaction_id}`, // Use transaction_id for uniqueness
      hash: transaction.hash!,
      blockchainId,
      fromAddress: transaction.from_address || null,
      toAddress: transaction.to_address || null,
      proxyAddress: null,
      cryptocurrency,
      cryptocurrencyAmount: transaction.amount || '0',
      valueTimestamp: new Date((transaction.timestamp || 0) * 1000),
      organizationId,
      financialTransactionParent: parentTransaction,
      type,
      direction,
      status: FinancialTransactionChildMetadataStatus.SYNCED,
      gainLossInclusionStatus: GainLossInclusionStatus.ALL
    }

    // Update publicId and direction based on type (following EVM pattern)
    CreateFinancialTransactionChildDto.updatePublicIdAndDirectionBasedOnType(childDto)

    this.logger.info('Creating financial transaction child', {
      publicId: childDto.publicId,
      hash: childDto.hash,
      symbol: transaction.symbol,
      amount: transaction.amount,
      kind: transaction.kind,
      type: childDto.type,
      direction: childDto.direction
    })

    // Create/update child transaction using existing service method
    await this.financialTransactionsService.upsertChild(childDto)
  }

  private determineActivity(transactions: FinancialTransaction[]): FinancialTransactionParentActivity {
    // Simple logic - can be enhanced based on transaction analysis
    const hasIn = transactions.some(tx => tx.kind === 'IN')
    const hasOut = transactions.some(tx => tx.kind === 'OUT')

    if (hasIn && hasOut) {
      return FinancialTransactionParentActivity.SWAP
    } else {
      return FinancialTransactionParentActivity.TRANSFER
    }
  }

  private determineTypeAndDirection(transaction: FinancialTransaction): {
    type: FinancialTransactionChildMetadataType
    direction: FinancialTransactionChildMetadataDirection
  } {
    switch (transaction.kind) {
      case 'IN':
        return {
          type: FinancialTransactionChildMetadataType.DEPOSIT,
          direction: FinancialTransactionChildMetadataDirection.INCOMING
        }
      case 'OUT':
        return {
          type: FinancialTransactionChildMetadataType.WITHDRAWAL,
          direction: FinancialTransactionChildMetadataDirection.OUTGOING
        }
      default:
        return {
          type: FinancialTransactionChildMetadataType.DEPOSIT,
          direction: FinancialTransactionChildMetadataDirection.INCOMING
        }
    }
  }

  private async getCryptocurrency(symbol: string, address?: string) {
    // Try to find existing cryptocurrency by symbol first
    return await this.cryptocurrenciesService.getBySymbol(symbol)
  }

  /**
   * Get financial transactions for a wallet (same as EVM approach)
   */
  async getWalletFinancialTransactions(
    organizationId: string,
    walletPublicId: string,
    options: any = {}
  ) {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    // Use existing financial transactions service to get data
    return await this.financialTransactionsService.getAllChildPaging({
      ...options,
      walletAddresses: [wallet.address],
      blockchainIds: ['solana'] // Filter for Solana transactions
    }, organizationId)
  }

  /**
   * Get balance summary from financial transactions (like EVM)
   */
  async getWalletBalanceSummary(organizationId: string, walletPublicId: string) {
    const transactions = await this.getWalletFinancialTransactions(organizationId, walletPublicId, {
      size: 1000,
      page: 0
    })

    // Process transactions to calculate balance summary
    const balanceMap = new Map<string, { symbol: string, balance: number, usdValue: number }>()

    for (const tx of transactions.items) {
      const symbol = tx.cryptocurrency.symbol
      const amount = parseFloat(tx.cryptocurrencyAmount)
      const isIncoming = tx.financialTransactionChildMetadata?.direction === 'incoming'

      if (!balanceMap.has(symbol)) {
        balanceMap.set(symbol, { symbol, balance: 0, usdValue: 0 })
      }

      const current = balanceMap.get(symbol)!
      current.balance += isIncoming ? amount : -amount
    }

    return {
      tokens: Array.from(balanceMap.values()).filter(token => token.balance > 0),
      totalTransactions: transactions.totalItems
    }
  }

  /**
   * Get the latest Solana financial transaction.
   * If walletPublicId is provided, only transactions from that wallet are considered.
   * If walletPublicId is omitted, the latest transaction across the entire organization is returned.
   */
  async getLatestTransaction(
    organizationId: string,
    walletPublicId?: string,
    extraFilters: any = {}
  ) {
    let walletAddresses: string[] | undefined = undefined

    if (walletPublicId) {
      const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      walletAddresses = [wallet.address]
    }

    const page = await this.financialTransactionsService.getAllChildPaging(
      {
        size: 1,
        page: 0,
        walletAddresses,
        blockchainIds: ['solana'],
        sortBy: 'valueTimestamp',
        sortDirection: 'desc',
        ...extraFilters
      },
      organizationId
    )

    return page.items?.[0] ?? null
  }

  /**
   * Get the total number of Solana financial transactions.
   * If walletPublicId is provided, only transactions from that wallet are counted.
   * If walletPublicId is omitted, the total count is calculated across the entire organization.
   */
  async getTransactionCount(
    organizationId: string,
    walletPublicId?: string,
    extraFilters: any = {}
  ): Promise<number> {
    let walletAddresses: string[] | undefined = undefined

    if (walletPublicId) {
      const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      walletAddresses = [wallet.address]
    }

    const page = await this.financialTransactionsService.getAllChildPaging(
      {
        size: 1, // only need 1 item to get totalItems count
        page: 0,
        walletAddresses,
        blockchainIds: ['solana'],
        ...extraFilters
      },
      organizationId
    )

    return page.totalItems ?? 0
  }


}
