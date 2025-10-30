import { Injectable } from '@nestjs/common'
import { Decimal } from 'decimal.js'
import { LoggerService } from '../shared/logger/logger.service'
import { DataOnchainQueryService } from '../data-onchain-ingestor/data-onchain-query.service'
import { PortfolioPositionsEntityService, PortfolioTransactionsEntityService } from './entity-services/portfolio.entity-service'
import { HeliusService } from './helius.service'
import { PricesService } from '../prices/prices.service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { 
  PnLSummary, 
  PositionSummary, 
  TransactionAnalysis, 
  PortfolioAnalytics, 
  WalletBalance 
} from './interfaces'
import { 
  PortfolioOverview, 
  TokenHolding, 
  PortfolioQueryParams,
  PortfolioBalance 
} from './portfolio.interfaces'
import { PortfolioPosition, PortfolioTransaction } from './portfolio.entity'
import { FinancialTransaction } from '../data-onchain-ingestor/interfaces'

@Injectable()
export class PortfolioService {
  constructor(
    private readonly logger: LoggerService,
    private readonly dataOnchainQueryService: DataOnchainQueryService,
    private readonly portfolioPositionsService: PortfolioPositionsEntityService,
    private readonly portfolioTransactionsService: PortfolioTransactionsEntityService,
    private readonly heliusService: HeliusService,
    private readonly pricesService: PricesService,
    private readonly walletsService: WalletsEntityService
  ) {}

  async getWalletBalance(organizationId: string, walletPublicId: string): Promise<WalletBalance> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    return this.heliusService.getWalletBalance(wallet.address)
  }

  async syncWalletTransactions(organizationId: string, walletPublicId: string): Promise<void> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    this.logger.info('Syncing wallet transactions for PnL calculation', { 
      walletId: wallet.id, 
      address: wallet.address 
    })

    // Get transactions from data-onchain-ingestor
    const transactions = await this.dataOnchainQueryService.getTransactions(
      wallet.address, 
      'solana', 
      { limit: 1000, offset: 0, exclude_wsol: true }
    )

    // Process each transaction
    for (const transaction of transactions) {
      await this.processTransaction(organizationId, wallet.id, transaction)
    }

    // Update positions with current prices
    await this.updatePositionPrices(wallet.id)
  }

  private async processTransaction(
    organizationId: string, 
    walletId: string, 
    transaction: FinancialTransaction
  ): Promise<void> {
    // Check if transaction already processed
    const existing = await this.portfolioTransactionsService.getByTransactionHash(
      transaction.hash, 
      'solana'
    )
    if (existing) return

    const txType = this.determineTransactionType(transaction)
    if (!txType) return // Skip unknown transaction types

    // Create portfolio transaction record
    const portfolioTx = await this.portfolioTransactionsService.createTransaction({
      organizationId,
      walletId,
      transactionHash: transaction.hash,
      blockchain: 'solana',
      symbol: transaction.symbol,
      tokenAddress: transaction.address || '',
      type: txType,
      quantity: transaction.amount || '0',
      pricePerToken: await this.getHistoricalPrice(transaction.symbol, new Date(transaction.timestamp * 1000)),
      fees: transaction.fee || '0',
      transactionDate: new Date(transaction.timestamp * 1000),
      blockNumber: transaction.block_number,
      metadata: transaction
    })

    // Update position
    await this.updatePosition(walletId, portfolioTx)
  }

  private determineTransactionType(transaction: FinancialTransaction): string | null {
    if (!transaction.kind) return null

    // Simple mapping - can be enhanced based on transaction analysis
    switch (transaction.kind) {
      case 'IN':
        return transaction.from_address ? 'TRANSFER_IN' : 'BUY'
      case 'OUT':
        return transaction.to_address ? 'TRANSFER_OUT' : 'SELL'
      default:
        return null
    }
  }

  private async updatePosition(walletId: string, transaction: PortfolioTransaction): Promise<void> {
    let position = await this.portfolioPositionsService.getByWalletAndSymbol(
      walletId, 
      transaction.symbol
    )

    if (!position) {
      position = PortfolioPosition.create({
        organizationId: transaction.organizationId,
        walletId,
        symbol: transaction.symbol,
        address: transaction.tokenAddress,
        blockchain: 'solana',
        quantity: '0',
        averageCostPrice: '0',
        totalCost: '0',
        currentPrice: '0',
        currentValue: '0',
        unrealizedPnL: '0',
        unrealizedPnLPercentage: '0',
        realizedPnL: '0',
        totalFees: '0'
      })
    }

    const quantity = new Decimal(position.quantity)
    const totalCost = new Decimal(position.totalCost)
    const txQuantity = new Decimal(transaction.quantity)
    const txPrice = new Decimal(transaction.pricePerToken || 0)
    const txValue = txQuantity.mul(txPrice)

    switch (transaction.type) {
      case 'BUY':
      case 'TRANSFER_IN':
        const newQuantity = quantity.add(txQuantity)
        const newTotalCost = totalCost.add(txValue)
        
        position.quantity = newQuantity.toString()
        position.totalCost = newTotalCost.toString()
        position.averageCostPrice = newQuantity.gt(0) ? 
          newTotalCost.div(newQuantity).toString() : '0'
        
        if (!position.firstPurchaseDate) {
          position.firstPurchaseDate = transaction.transactionDate
        }
        break

      case 'SELL':
      case 'TRANSFER_OUT':
        if (quantity.gte(txQuantity)) {
          const remainingQuantity = quantity.sub(txQuantity)
          const avgCost = new Decimal(position.averageCostPrice)
          const soldCost = txQuantity.mul(avgCost)
          const realizedPnL = txValue.sub(soldCost)
          
          position.quantity = remainingQuantity.toString()
          position.totalCost = totalCost.sub(soldCost).toString()
          position.realizedPnL = new Decimal(position.realizedPnL).add(realizedPnL).toString()
          
          // Update transaction with realized PnL
          transaction.realizedPnL = realizedPnL.toString()
          await this.portfolioTransactionsService.updateTransaction(transaction)
        }
        break
    }

    // Update fees
    position.totalFees = new Decimal(position.totalFees)
      .add(transaction.fees || 0).toString()

    position.lastTransactionDate = transaction.transactionDate

    await this.portfolioPositionsService.updatePosition(position)
  }

  private async updatePositionPrices(walletId: string): Promise<void> {
    const positions = await this.portfolioPositionsService.getByWallet(walletId)

    for (const position of positions) {
      const currentPrice = await this.getCurrentPrice(position.symbol)
      const quantity = new Decimal(position.quantity)
      const currentValue = quantity.mul(currentPrice)
      const totalCost = new Decimal(position.totalCost)
      const unrealizedPnL = currentValue.sub(totalCost)
      const unrealizedPnLPercentage = totalCost.gt(0) ? 
        unrealizedPnL.div(totalCost).mul(100) : new Decimal(0)

      position.currentPrice = currentPrice.toString()
      position.currentValue = currentValue.toString()
      position.unrealizedPnL = unrealizedPnL.toString()
      position.unrealizedPnLPercentage = unrealizedPnLPercentage.toString()
      position.priceLastUpdatedAt = new Date()

      await this.portfolioPositionsService.updatePosition(position)
    }
  }

  async getWalletPnL(organizationId: string, walletPublicId: string): Promise<PnLSummary> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const positions = await this.portfolioPositionsService.getByWallet(wallet.id)
    
    let totalInvested = 0
    let currentValue = 0
    let totalUnrealizedPnL = 0
    let totalRealizedPnL = 0
    let totalFees = 0

    const positionSummaries: PositionSummary[] = positions.map(position => {
      const invested = parseFloat(position.totalCost)
      const value = parseFloat(position.currentValue)
      const unrealizedPnL = parseFloat(position.unrealizedPnL)
      const realizedPnL = parseFloat(position.realizedPnL)
      const fees = parseFloat(position.totalFees)

      totalInvested += invested
      currentValue += value
      totalUnrealizedPnL += unrealizedPnL
      totalRealizedPnL += realizedPnL
      totalFees += fees

      return {
        symbol: position.symbol,
        tokenAddress: position.address,
        quantity: parseFloat(position.quantity),
        averageCostPrice: parseFloat(position.averageCostPrice),
        currentPrice: parseFloat(position.currentPrice),
        currentValue: value,
        unrealizedPnL,
        unrealizedPnLPercentage: parseFloat(position.unrealizedPnLPercentage),
        realizedPnL,
        totalCost: invested,
        firstPurchaseDate: position.firstPurchaseDate,
        lastTransactionDate: position.lastTransactionDate
      }
    })

    const totalPnL = totalUnrealizedPnL + totalRealizedPnL
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    return {
      walletId: wallet.id,
      address: wallet.address,
      totalInvested,
      currentValue,
      totalUnrealizedPnL,
      totalRealizedPnL,
      totalPnL,
      totalPnLPercentage,
      totalFees,
      positions: positionSummaries
    }
  }

  private async getCurrentPrice(symbol: string): Promise<Decimal> {
    try {
      // Try to get price from Jupiter/Helius first, fallback to Coingecko
      const prices = await this.heliusService.getTokenPrices([symbol])
      if (prices.length > 0) {
        return new Decimal(prices[0].price)
      }
      
      // Fallback to internal price service
      return new Decimal(0) // Implement Coingecko fallback if needed
    } catch (error) {
      this.logger.error('Failed to get current price', error, { symbol })
      return new Decimal(0)
    }
  }

  private async getHistoricalPrice(symbol: string, date: Date): Promise<string> {
    try {
      // Implement historical price lookup
      // For now, return current price
      const price = await this.getCurrentPrice(symbol)
      return price.toString()
    } catch (error) {
      this.logger.error('Failed to get historical price', error, { symbol, date })
      return '0'
    }
  }

  /**
   * Get comprehensive portfolio overview matching the UI image
   * Supports filtering and follows EVM balance response pattern
   */
  async getPortfolioOverview(
    organizationId: string, 
    params: PortfolioQueryParams
  ): Promise<PortfolioOverview> {
    try {
      this.logger.info('Generating portfolio overview', { 
        organizationId, 
        params 
      })

      // Get organization wallets
      let wallets = []
      if (params.walletIds?.length) {
        wallets = await this.walletsService.getByOrganizationAndPublicIds(organizationId, params.walletIds)
      } else {
        wallets = await this.walletsService.getAllByOrganizationId(organizationId)
      }

      // Filter Solana wallets if blockchain filter is specified
      if (params.blockchainIds?.length) {
        wallets = wallets.filter(wallet => 
          wallet.supportedBlockchains.some(chain => 
            params.blockchainIds.some(filterChain => chain.includes(filterChain))
          )
        )
      }

      // Get Solana wallets specifically
      const solanaWallets = wallets.filter(wallet => 
        wallet.supportedBlockchains.some(chain => chain.includes('solana'))
      )

      this.logger.debug('Processing wallets', {
        totalWallets: wallets.length,
        solanaWallets: solanaWallets.length
      })

      // Get balance data from all wallets
      const walletBalances = await Promise.all(
        solanaWallets.map(async (wallet) => {
          try {
            return await this.heliusService.getWalletBalance(wallet.address)
          } catch (error) {
            this.logger.error(`Failed to get balance for wallet ${wallet.publicId}`, error)
            return null
          }
        })
      )

      const validBalances = walletBalances.filter(balance => balance !== null)

      // Aggregate token holdings across all wallets
      const aggregatedTokens = this.aggregateTokenHoldings(validBalances)

      // Calculate totals
      const totalBalance = validBalances.reduce(
        (sum, balance) => sum.plus(balance.totalValueUsd || 0), 
        new Decimal(0)
      )

      // Generate portfolio breakdown similar to the image
      const holdings = this.calculateTokenHoldings(aggregatedTokens, totalBalance)

      const portfolioOverview: PortfolioOverview = {
        totalBalance: {
          value: totalBalance.toFixed(2),
          currency: params.fiatCurrency || 'USD',
          formatted: `$${totalBalance.toNumber().toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          })} USD`
        },
        holdings,
        summary: {
          totalWallets: solanaWallets.length,
          totalTokens: holdings.length,
          topHolding: holdings[0] || null,
          lastUpdated: new Date()
        },
        breakdown: this.generateBreakdownChart(holdings)
      }

      this.logger.info('Portfolio overview generated successfully', {
        totalBalance: portfolioOverview.totalBalance.formatted,
        holdingsCount: holdings.length
      })

      return portfolioOverview

    } catch (error) {
      this.logger.error('Failed to generate portfolio overview', error)
      throw new Error(`Portfolio overview failed: ${error.message}`)
    }
  }

  /**
   * Aggregate token holdings from multiple wallets
   */
  private aggregateTokenHoldings(walletBalances: any[]): Map<string, any> {
    const tokenMap = new Map()

    walletBalances.forEach(balance => {
      // Add native SOL
      if (balance.nativeBalance) {
        const solKey = 'SOLANA'
        if (tokenMap.has(solKey)) {
          const existing = tokenMap.get(solKey)
          existing.uiAmount += balance.nativeBalance.uiAmount
          existing.valueUsd += balance.nativeBalance.valueUsd || 0
        } else {
          tokenMap.set(solKey, {
            symbol: 'SOLANA',
            name: 'Solana',
            uiAmount: balance.nativeBalance.uiAmount,
            valueUsd: balance.nativeBalance.valueUsd || 0,
            priceUsd: balance.nativeBalance.priceUsd || 0,
            address: 'native'
          })
        }
      }

      // Add token balances
      balance.tokenBalances?.forEach(token => {
        const key = token.symbol.toUpperCase()
        if (tokenMap.has(key)) {
          const existing = tokenMap.get(key)
          existing.uiAmount += token.uiAmount
          existing.valueUsd += token.valueUsd || 0
        } else {
          tokenMap.set(key, {
            symbol: token.symbol.toUpperCase(),
            name: token.symbol, // Could enhance with token metadata
            uiAmount: token.uiAmount,
            valueUsd: token.valueUsd || 0,
            priceUsd: token.priceUsd || 0,
            address: token.address
          })
        }
      })
    })

    return tokenMap
  }

  /**
   * Calculate token holdings with percentages and formatting
   */
  private calculateTokenHoldings(tokenMap: Map<string, any>, totalBalance: Decimal): TokenHolding[] {
    const holdings: TokenHolding[] = []

    tokenMap.forEach((token, symbol) => {
      const valueUsd = new Decimal(token.valueUsd || 0)
      const percentage = totalBalance.gt(0) ? valueUsd.div(totalBalance).mul(100) : new Decimal(0)

      // Only include tokens with meaningful value (>$1)
      if (valueUsd.gte(1)) {
        holdings.push({
          symbol: token.symbol,
          name: token.name,
          amount: token.uiAmount.toFixed(2),
          valueUsd: valueUsd.toFixed(0), // No decimals for large values
          formattedValue: `$${valueUsd.toNumber().toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })} USD`,
          percentage: percentage.toFixed(2),
          formattedPercentage: `${percentage.toFixed(2)}%`,
          priceUsd: token.priceUsd?.toString() || '0',
          address: token.address,
          color: this.getTokenColor(token.symbol) // For UI color coding
        })
      }
    })

    // Sort by value descending
    return holdings.sort((a, b) => 
      new Decimal(b.valueUsd).cmp(new Decimal(a.valueUsd))
    )
  }

  /**
   * Generate breakdown data for chart visualization
   */
  private generateBreakdownChart(holdings: TokenHolding[]) {
    return holdings.map(holding => ({
      symbol: holding.symbol,
      name: holding.name,
      value: holding.valueUsd,
      percentage: holding.percentage,
      color: holding.color
    }))
  }

  /**
   * Get color mapping for popular tokens (matching common UI patterns)
   */
  private getTokenColor(symbol: string): string {
    const colorMap: Record<string, string> = {
      'SOLANA': '#9945FF',  // Solana purple 
      'SOL': '#9945FF',     // Solana purple
      'BONK': '#F5A623',    // Orange/yellow
      'WIF': '#8B4513',     // Brown
      'TRUMP': '#FF6B6B',   // Red
      'USDC': '#2775CA',    // Blue
      'USDT': '#26A17B',    // Green
      'WSOL': '#9945FF',    // Same as SOL
    }

    return colorMap[symbol.toUpperCase()] || '#6B7280' // Default gray
  }

  /**
   * Get portfolio balance in EVM-compatible format
   * This maintains compatibility with existing balance endpoints
   */
  async getPortfolioBalance(
    organizationId: string,
    params: PortfolioQueryParams
  ): Promise<PortfolioBalance> {
    const overview = await this.getPortfolioOverview(organizationId, params)

    // Convert to EVM balance format for compatibility
    return {
      value: overview.totalBalance.value,
      fiatCurrency: overview.totalBalance.currency,
      groups: params.groupBy ? this.generateGroupedBalance(overview, params) : undefined
    }
  }

  /**
   * Generate grouped balance data for compatibility with existing groupBy functionality
   */
  private generateGroupedBalance(overview: PortfolioOverview, params: PortfolioQueryParams) {
    // For now, return simple structure - can be enhanced based on existing EVM grouping
    return {
      [params.groupBy]: {
        value: overview.totalBalance.value,
        currency: overview.totalBalance.currency,
        items: overview.holdings.map(holding => ({
          symbol: holding.symbol,
          value: holding.valueUsd,
          percentage: holding.percentage
        }))
      }
    }
  }

  /**
   * Get dashboard-style portfolio overview matching the UI image format
   * Returns data exactly as shown in the attached dashboard image
   */
  async getDashboardOverview(organizationId: string, walletPublicId: string) {
    try {
      const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
      if (!wallet) {
        throw new Error('Wallet not found')
      }

      this.logger.info('Getting dashboard overview for wallet', { 
        organizationId, 
        walletPublicId, 
        walletAddress: wallet.address 
      })

      // Get comprehensive wallet balance with all tokens and prices
      const walletBalance = await this.heliusService.getWalletBalance(wallet.address)

      // Format total balance
      const totalBalance = walletBalance.totalValueUsd || 0
      const formattedTotalBalance = `$${totalBalance.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })} USD`

      // Process all tokens (including SOL) and format for dashboard
      const tokens = []

      // Add SOL first (native balance)
      if (walletBalance.nativeBalance) {
        const solValue = walletBalance.nativeBalance.valueUsd || 0
        const solPercentage = totalBalance > 0 ? (solValue / totalBalance) * 100 : 0

        tokens.push({
          symbol: 'SOLANA',
          value: `$${solValue.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })} USD`,
          valueRaw: solValue,
          percentage: parseFloat(solPercentage.toFixed(2)),
          formattedPercentage: `${solPercentage.toFixed(2)}%`,
          color: '#9945FF', // Solana purple
          amount: walletBalance.nativeBalance.uiAmount,
          priceUsd: walletBalance.nativeBalance.priceUsd,
          priceChange24h: walletBalance.nativeBalance.priceChange24h
        })
      }

      // Add all other tokens
      walletBalance.tokenBalances?.forEach(token => {
        const tokenValue = token.valueUsd || 0
        const tokenPercentage = totalBalance > 0 ? (tokenValue / totalBalance) * 100 : 0

        // Only include tokens with meaningful value (>$1)
        if (tokenValue >= 1) {
          tokens.push({
            symbol: token.symbol,
            value: `$${tokenValue.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })} USD`,
            valueRaw: tokenValue,
            percentage: parseFloat(tokenPercentage.toFixed(2)),
            formattedPercentage: `${tokenPercentage.toFixed(2)}%`,
            color: this.getTokenColor(token.symbol),
            amount: token.uiAmount,
            priceUsd: token.priceUsd,
            priceChange24h: token.priceChange24h,
            address: token.address
          })
        }
      })

      // Sort tokens by value (highest first)
      tokens.sort((a, b) => b.valueRaw - a.valueRaw)

      const dashboardData = {
        totalBalance: formattedTotalBalance,
        totalBalanceRaw: totalBalance,
        walletAddress: wallet.address,
        tokens,
        lastUpdated: new Date().toISOString(),
        summary: {
          tokenCount: tokens.length,
          largestHolding: tokens[0] || null
        }
      }

      this.logger.info('Dashboard overview generated successfully', {
        totalBalance: formattedTotalBalance,
        tokenCount: tokens.length,
        topToken: tokens[0]?.symbol
      })

      return dashboardData

    } catch (error) {
      this.logger.error('Failed to generate dashboard overview', error, { 
        organizationId, 
        walletPublicId 
      })
      throw new Error(`Dashboard overview failed: ${error.message}`)
    }
  }

  /**
   * Get token holders across all organization wallets
   * Shows which wallets hold a specific token with their balances
   */
  async getTokenHolders(
    organizationId: string, 
    tokenSymbol: string, 
    options: {
      minBalance?: number
      sortBy?: 'balance' | 'percentage' | 'walletAddress'
    } = {}
  ) {
    try {
      this.logger.info('Getting token holders', { 
        organizationId, 
        tokenSymbol, 
        options 
      })

      // Get all organization wallets
      const wallets = await this.walletsService.getAllByOrganizationId(organizationId)
      
      // Filter Solana wallets only
      const solanaWallets = wallets.filter(wallet => 
        wallet.supportedBlockchains.some(chain => chain.includes('solana'))
      )

      this.logger.debug('Processing wallets for token holders', {
        totalWallets: wallets.length,
        solanaWallets: solanaWallets.length,
        targetToken: tokenSymbol
      })

      // Get balance data from all wallets
      const walletBalances = await Promise.all(
        solanaWallets.map(async (wallet) => {
          try {
            const balance = await this.heliusService.getWalletBalance(wallet.address)
            return { wallet, balance }
          } catch (error) {
            this.logger.error(`Failed to get balance for wallet ${wallet.publicId}`, error)
            return { wallet, balance: null }
          }
        })
      )

      const validWalletBalances = walletBalances.filter(wb => wb.balance !== null)

      // Extract token holders
      const holders = []
      let totalTokenAmount = 0
      let totalValueUsd = 0
      let tokenPrice = 0

      for (const { wallet, balance } of validWalletBalances) {
        let tokenBalance = null
        let tokenValue = 0

        // Check if wallet holds the specific token
        if (tokenSymbol === 'SOLANA' || tokenSymbol === 'SOL') {
          // Native SOL balance
          if (balance.nativeBalance && balance.nativeBalance.uiAmount > 0) {
            tokenBalance = {
              amount: balance.nativeBalance.uiAmount,
              valueUsd: balance.nativeBalance.valueUsd || 0,
              priceUsd: balance.nativeBalance.priceUsd || 0
            }
          }
        } else {
          // Token balance
          const tokenData = balance.tokenBalances?.find(token => 
            token.symbol.toUpperCase() === tokenSymbol
          )
          
          if (tokenData && tokenData.uiAmount > 0) {
            tokenBalance = {
              amount: tokenData.uiAmount,
              valueUsd: tokenData.valueUsd || 0,
              priceUsd: tokenData.priceUsd || 0
            }
          }
        }

        // Add to holders if balance exists and meets minimum requirement
        if (tokenBalance && tokenBalance.amount > (options.minBalance || 0)) {
          holders.push({
            walletAddress: wallet.address,
            walletPublicId: wallet.publicId,
            walletName: wallet.name || null,
            balance: tokenBalance.amount,
            valueUsd: tokenBalance.valueUsd,
            priceUsd: tokenBalance.priceUsd
          })

          totalTokenAmount += tokenBalance.amount
          totalValueUsd += tokenBalance.valueUsd
          tokenPrice = tokenBalance.priceUsd // Use the latest price
        }
      }

      // Calculate percentages
      const holdersWithPercentages = holders.map(holder => ({
        ...holder,
        percentage: totalTokenAmount > 0 ? (holder.balance / totalTokenAmount) * 100 : 0,
        formattedPercentage: totalTokenAmount > 0 ? 
          `${((holder.balance / totalTokenAmount) * 100).toFixed(2)}%` : '0%',
        formattedBalance: holder.balance.toLocaleString('en-US', {
          maximumFractionDigits: tokenSymbol === 'SOL' || tokenSymbol === 'SOLANA' ? 4 : 2
        }),
        formattedValue: `$${holder.valueUsd.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`
      }))

      // Sort holders
      const sortBy = options.sortBy || 'balance'
      holdersWithPercentages.sort((a, b) => {
        switch (sortBy) {
          case 'balance':
            return b.balance - a.balance
          case 'percentage':
            return b.percentage - a.percentage
          case 'walletAddress':
            return a.walletAddress.localeCompare(b.walletAddress)
          default:
            return b.balance - a.balance
        }
      })

      const tokenHoldersData = {
        tokenSymbol,
        tokenName: this.getTokenName(tokenSymbol),
        tokenPrice,
        formattedTokenPrice: `$${tokenPrice.toLocaleString('en-US', {
          minimumFractionDigits: tokenPrice < 1 ? 6 : 2,
          maximumFractionDigits: tokenPrice < 1 ? 6 : 2
        })}`,
        totalHolders: holders.length,
        totalTokens: totalTokenAmount,
        formattedTotalTokens: totalTokenAmount.toLocaleString('en-US', {
          maximumFractionDigits: tokenSymbol === 'SOL' || tokenSymbol === 'SOLANA' ? 2 : 0
        }),
        totalValueUsd,
        formattedTotalValue: `$${totalValueUsd.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`,
        averageBalance: holders.length > 0 ? totalTokenAmount / holders.length : 0,
        holders: holdersWithPercentages,
        lastUpdated: new Date().toISOString()
      }

      this.logger.info('Token holders analysis completed', {
        tokenSymbol,
        totalHolders: holders.length,
        totalValue: tokenHoldersData.formattedTotalValue
      })

      return tokenHoldersData

    } catch (error) {
      this.logger.error('Failed to get token holders', error, { 
        organizationId, 
        tokenSymbol 
      })
      throw new Error(`Token holders analysis failed: ${error.message}`)
    }
  }

  /**
   * Get human-readable token name from symbol
   */
  private getTokenName(symbol: string): string {
    const nameMap: Record<string, string> = {
      'SOL': 'Solana',
      'SOLANA': 'Solana',
      'BONK': 'Bonk',
      'WIF': 'dogwifhat',
      'TRUMP': 'TRUMP',
      'USDC': 'USD Coin',
      'USDT': 'Tether',
      'JUP': 'Jupiter',
      'WSOL': 'Wrapped SOL'
    }

    return nameMap[symbol.toUpperCase()] || symbol
  }
}