import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../shared/logger/logger.service'
import { firstValueFrom } from 'rxjs'
import {
  FinancialTransaction,
  TransactionFilters,
  TransactionAggregate,
  TokenInfo,
  TokenBalance,
  AddressCount,
  AddressJob,
  AddressRegistry,
  WalletTransactionHistory,
  WalletPortfolio,
  TransactionDetails,
  WalletInsights
} from './interfaces'

/**
 * Comprehensive service for querying indexed blockchain data from data-onchain-ingestor
 * This service provides a clean interface for the UI to access financial transaction data
 */
@Injectable()
export class DataOnchainQueryService {
  private readonly ingestorBaseUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.ingestorBaseUrl = this.configService.get('DATA_ONCHAIN_INGESTOR_URL') || 'http://localhost:8000'
  }

  // ===== CORE TRANSACTION QUERIES =====

  /**
   * Get financial transactions for an address with comprehensive filtering
   */
  async getTransactions(
    address: string,
    chain_id: string,
    filters: TransactionFilters = {}
  ): Promise<FinancialTransaction[]> {
    try {
      const params = {
        index_address: address,
        chain_id,
        ...filters
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.ingestorBaseUrl}/transactions`, {
          params,
          timeout: 15000
        })
      )

      const payload = response?.data
      // Normalize to always return an array of transactions
      let transactions: any[] = []
      if (Array.isArray(payload)) {
        transactions = payload
      } else if (Array.isArray(payload?.transactions)) {
        transactions = payload.transactions
      } else if (Array.isArray(payload?.data)) {
        transactions = payload.data
      } else if (Array.isArray(payload?.items)) {
        transactions = payload.items
      } else if (payload && typeof payload === 'object') {
        // Unexpected shape; log once at debug level and return empty array
        this.logger.debug?.('getTransactions received non-array payload; normalized to empty array', {
          receivedKeys: Object.keys(payload)
        })
        transactions = []
      }

      return transactions
    } catch (error) {
      this.logger.error('Failed to fetch transactions', error, { address, chain_id, filters })
      throw new HttpException('Failed to fetch transactions', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get aggregated balance summary for an address
   */
  async getBalanceAggregates(
    address: string,
    chain_id: string,
    options: {
      by_symbol?: boolean
      include_fee?: boolean
      exclude_wsol?: boolean
    } = {}
  ): Promise<TransactionAggregate[]> {
    try {
      const params = {
        index_address: address,
        chain_id,
        by_symbol: options.by_symbol ?? true,
        include_fee: options.include_fee ?? true,
        exclude_wsol: options.exclude_wsol ?? true
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.ingestorBaseUrl}/transactions/aggregate`, {
          params,
          timeout: 15000
        })
      )

      return response.data || []
    } catch (error) {
      this.logger.error('Failed to fetch balance aggregates', error, { address, chain_id, options })
      throw new HttpException('Failed to fetch balance aggregates', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get transaction count for an address
   */
  async getAddressTransactionCount(address: string, chain_id: string): Promise<AddressCount> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ingestorBaseUrl}/address/${chain_id}/${address}/count`, {
          timeout: 10000
        })
      )

      return response.data
    } catch (error) {
      this.logger.error('Failed to fetch address count', error, { address, chain_id })
      return {
        chain_id,
        indexed_address: address,
        financial_transaction_count: null
      }
    }
  }

  // ===== TOKEN INFORMATION =====

  /**
   * Get token metadata
   */
  async getTokens(searchQuery?: string, limit: number = 100): Promise<TokenInfo[]> {
    try {
      const params: any = { limit }
      if (searchQuery) {
        params.q = searchQuery
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.ingestorBaseUrl}/tokens`, {
          params,
          timeout: 10000
        })
      )

      return response.data || []
    } catch (error) {
      this.logger.error('Failed to fetch tokens', error, { searchQuery, limit })
      return []
    }
  }

  /**
   * Get specific token information by symbol
   */
  async getTokenBySymbol(symbol: string): Promise<TokenInfo | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ingestorBaseUrl}/tokens/${symbol}`, {
          timeout: 10000
        })
      )

      return response.data
    } catch (error) {
      this.logger.error('Failed to fetch token by symbol', error, { symbol })
      return null
    }
  }

  // ===== INDEXING STATUS AND JOBS =====

  /**
   * Get address indexing jobs
   */
  async getAddressJobs(
    address?: string,
    chain_id?: string,
    run_id?: string,
    limit: number = 10
  ): Promise<AddressJob[]> {
    try {
      const params: any = { limit }
      if (address) params.indexed_address = address
      if (chain_id) params.chain_id = chain_id
      if (run_id) params.run_id = run_id

      const response = await firstValueFrom(
        this.httpService.get(`${this.ingestorBaseUrl}/address-jobs`, {
          params,
          timeout: 10000
        })
      )

      return response.data || []
    } catch (error) {
      this.logger.error('Failed to fetch address jobs', error, { address, chain_id, run_id })
      return []
    }
  }

  /**
   * Get address registry information
   */
  async getAddressRegistry(
    chain_id?: string,
    status?: number,
    limit: number = 100
  ): Promise<AddressRegistry[]> {
    try {
      const params: any = { limit }
      if (chain_id) params.chain_id = chain_id
      if (status !== undefined) params.status = status

      const response = await firstValueFrom(
        this.httpService.get(`${this.ingestorBaseUrl}/address-registry`, {
          params,
          timeout: 10000
        })
      )

      return response.data || []
    } catch (error) {
      this.logger.error('Failed to fetch address registry', error, { chain_id, status })
      return []
    }
  }

  // ===== UI-OPTIMIZED METHODS =====

  /**
   * Get comprehensive wallet transaction history with pagination
   */
  async getWalletTransactionHistory(
    wallet_id: string,
    address: string,
    chain_id: string,
    page: number = 1,
    per_page: number = 50,
    filters: TransactionFilters = {}
  ): Promise<WalletTransactionHistory> {
    const offset = (page - 1) * per_page
    const limit = per_page

    // Get transactions with pagination
    const transactions = await this.getTransactions(address, chain_id, {
      ...filters,
      limit,
      offset,
      sort: 'created_at_desc'
    })

    // Get total count
    const countData = await this.getAddressTransactionCount(address, chain_id)
    const total_transactions = countData.financial_transaction_count || 0

    const total_pages = Math.ceil(total_transactions / per_page)

    return {
      wallet_id,
      address,
      chain_id,
      total_transactions,
      transactions,
      pagination: {
        current_page: page,
        per_page,
        total_pages,
        has_next: page < total_pages,
        has_previous: page > 1
      }
    }
  }

  /**
   * Get wallet portfolio with token balances and USD values
   */
  async getWalletPortfolio(
    wallet_id: string,
    address: string,
    chain_id: string
  ): Promise<WalletPortfolio> {
    try {
      // Get balance aggregates
      const aggregates = await this.getBalanceAggregates(address, chain_id, {
        by_symbol: true,
        include_fee: true,
        exclude_wsol: true
      })

      // Convert aggregates to token balances with metadata
      const balances: TokenBalance[] = []
      let total_usd_value = 0

      for (const aggregate of aggregates) {
        const balance = parseFloat(aggregate.sum)
        if (balance !== 0) { // Only include non-zero balances
          // Get token metadata for better display
          const tokenInfo = await this.getTokenBySymbol(aggregate.symbol)

          const tokenBalance: TokenBalance = {
            symbol: aggregate.symbol,
            address: aggregate.address,
            balance: aggregate.sum,
            formatted_balance: this.formatBalance(balance, tokenInfo?.decimals || 9)
          }

          balances.push(tokenBalance)
        }
      }

      // Get sync status from recent jobs
      const recentJobs = await this.getAddressJobs(address, chain_id, undefined, 1)
      const sync_status = this.determineSyncStatus(recentJobs)

      return {
        wallet_id,
        address,
        chain_id,
        total_usd_value,
        balances,
        last_updated: new Date().toISOString(),
        sync_status
      }
    } catch (error) {
      this.logger.error('Failed to build wallet portfolio', error, { wallet_id, address, chain_id })
      throw new HttpException('Failed to build wallet portfolio', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get detailed transaction information with related transactions
   */
  async getTransactionDetails(
    transaction_id: string,
    address: string,
    chain_id: string
  ): Promise<TransactionDetails | null> {
    try {
      // Get the main transaction
      const transactions = await this.getTransactions(address, chain_id, { limit: 1000 })
      const transaction = transactions.find(tx => tx.transaction_id === transaction_id)

      if (!transaction) {
        return null
      }

      // Get related transactions (same hash or block)
      const related_transactions = transactions.filter(tx =>
        tx.transaction_id !== transaction_id &&
        (tx.hash === transaction.hash || tx.block_number === transaction.block_number)
      ).slice(0, 10) // Limit related transactions

      return {
        transaction,
        related_transactions,
        metadata: {
          block_explorer_url: this.buildBlockExplorerUrl(transaction.hash, chain_id),
          transaction_type_display: this.getTransactionTypeDisplay(transaction),
          fees_breakdown: this.calculateFeesBreakdown(transaction)
        }
      }
    } catch (error) {
      this.logger.error('Failed to get transaction details', error, { transaction_id, address, chain_id })
      return null
    }
  }

  /**
   * Get wallet insights and analytics
   */
  async getWalletInsights(
    address: string,
    chain_id: string,
    days: number = 30
  ): Promise<WalletInsights> {
    try {
      // Get recent transactions for analysis
      const cutoffTime = Math.floor((Date.now() - (days * 24 * 60 * 60 * 1000)) / 1000)

      const transactions = await this.getTransactions(address, chain_id, {
        from_time: cutoffTime,
        limit: 1000,
        sort: 'created_at_desc'
      })

      const balances = await this.getBalanceAggregates(address, chain_id)

      // Calculate insights
      const summary = {
        total_transactions: transactions.length,
        total_in: transactions.filter(tx => tx.kind === 'IN').length,
        total_out: transactions.filter(tx => tx.kind === 'OUT').length,
        net_flow: this.calculateNetFlow(transactions),
        active_tokens: new Set(transactions.map(tx => tx.symbol)).size
      }

      const top_tokens = balances
        .filter(b => parseFloat(b.sum) > 0)
        .sort((a, b) => parseFloat(b.sum) - parseFloat(a.sum))
        .slice(0, 10)
        .map(aggregate => ({
          symbol: aggregate.symbol,
          address: aggregate.address,
          balance: aggregate.sum,
          formatted_balance: this.formatBalance(parseFloat(aggregate.sum), 9)
        }))

      return {
        address,
        chain_id,
        summary,
        top_tokens,
        transaction_trends: {
          daily_count: this.calculateDailyTrends(transactions, days),
          weekly_volume: this.calculateWeeklyVolume(transactions, days)
        }
      }
    } catch (error) {
      this.logger.error('Failed to generate wallet insights', error, { address, chain_id, days })
      throw new HttpException('Failed to generate wallet insights', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // ===== UTILITY METHODS =====

  private formatBalance(balance: number, decimals: number): string {
    if (balance === 0) return '0'
    if (balance < 0.01) return '<0.01'
    return balance.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  private determineSyncStatus(jobs: AddressJob[]): 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'UNKNOWN' {
    if (!jobs.length) return 'UNKNOWN'
    const latestJob = jobs[0]

    switch (latestJob.status) {
      case 1: return 'COMPLETED'
      case 0: return 'PROCESSING'
      case -1: return 'FAILED'
      default: return 'UNKNOWN'
    }
  }

  private buildBlockExplorerUrl(hash: string | undefined, chain_id: string): string | undefined {
    if (!hash) return undefined

    if (chain_id.includes('solana')) {
      return `https://solscan.io/tx/${hash}`
    } else if (chain_id.includes('ethereum')) {
      return `https://etherscan.io/tx/${hash}`
    }

    return undefined
  }

  private getTransactionTypeDisplay(transaction: FinancialTransaction): string {
    const { type, kind, symbol } = transaction

    if (type === 'TRANSFER') {
      return kind === 'IN' ? `Received ${symbol}` : `Sent ${symbol}`
    } else if (type === 'FEE') {
      return 'Network Fee'
    }

    return type || 'Unknown'
  }

  private calculateFeesBreakdown(transaction: FinancialTransaction) {
    const fee = parseFloat(transaction.fee || '0')

    if (fee === 0) return undefined

    return {
      network_fee: transaction.fee || '0'
    }
  }

  private calculateNetFlow(transactions: FinancialTransaction[]): number {
    return transactions.reduce((net, tx) => {
      const amount = parseFloat(tx.amount || '0')
      return tx.kind === 'IN' ? net + amount : net - amount
    }, 0)
  }

  private calculateDailyTrends(transactions: FinancialTransaction[], days: number) {
    const dailyCounts: { [date: string]: number } = {}

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      dailyCounts[date] = 0
    }

    // Count transactions by day
    transactions.forEach(tx => {
      if (tx.timestamp) {
        const date = new Date(tx.timestamp * 1000).toISOString().split('T')[0]
        if (dailyCounts[date] !== undefined) {
          dailyCounts[date]++
        }
      }
    })

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private calculateWeeklyVolume(transactions: FinancialTransaction[], days: number) {
    // Simplified weekly volume calculation
    const weeks = Math.ceil(days / 7)
    const weeklyVolume: Array<{ week: string; volume: number }> = []

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)

      const weekTransactions = transactions.filter(tx => {
        if (!tx.timestamp) return false
        const txDate = new Date(tx.timestamp * 1000)
        return txDate >= weekStart && txDate < weekEnd
      })

      const volume = weekTransactions.reduce((sum, tx) => {
        return sum + parseFloat(tx.amount || '0')
      }, 0)

      weeklyVolume.push({
        week: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`,
        volume
      })
    }

    return weeklyVolume.reverse()
  }
}
