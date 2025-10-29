export interface TokenBalance {
  symbol: string
  address: string
  amount: string
  decimals: number
  uiAmount: number
  priceUsd?: number
  valueUsd?: number
  percentage?: number
  priceChange24h?: number
  name?: string // Token full name from Jupiter
  icon?: string // Token icon URL from Jupiter
}

export interface WalletBalance {
  address: string
  blockchain: string
  nativeBalance: {
    symbol: string
    amount: string
    decimals: number
    uiAmount: number
    priceUsd?: number
    valueUsd?: number
    percentage?: number
    priceChange24h?: number
  }
  tokenBalances: TokenBalance[]
  totalValueUsd: number
  lastUpdated: Date
}

export interface PnLSummary {
  walletId: string
  address: string
  totalInvested: number
  currentValue: number
  totalUnrealizedPnL: number
  totalRealizedPnL: number
  totalPnL: number
  totalPnLPercentage: number
  totalFees: number
  positions: PositionSummary[]
}

export interface PositionSummary {
  symbol: string
  tokenAddress: string
  quantity: number
  averageCostPrice: number
  currentPrice: number
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercentage: number
  realizedPnL: number
  totalCost: number
  firstPurchaseDate?: Date
  lastTransactionDate?: Date
}

export interface TransactionAnalysis {
  hash: string
  type: 'BUY' | 'SELL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'STAKE' | 'UNSTAKE' | 'REWARD'
  symbol: string
  quantity: number
  pricePerToken?: number
  totalValue?: number
  fees: number
  realizedPnL?: number
  date: Date
}

export interface PortfolioAnalytics {
  overview: {
    totalValue: number
    totalInvested: number
    totalPnL: number
    totalPnLPercentage: number
    totalRealizedPnL: number
    totalUnrealizedPnL: number
    totalFees: number
    bestPerformer?: PositionSummary
    worstPerformer?: PositionSummary
  }
  positions: PositionSummary[]
  recentTransactions: TransactionAnalysis[]
  performance: {
    daily: number
    weekly: number
    monthly: number
    allTime: number
  }
}

export interface HeliusTokenBalance {
  tokenAccount: string
  mint: string
  amount: string
  decimals: number
  tokenIcon?: string
  tokenName?: string
  tokenSymbol?: string
}

export interface HeliusWalletBalance {
  nativeBalance: number
  tokens: HeliusTokenBalance[]
}

export interface PriceData {
  symbol: string
  address: string
  price: number
  priceChange24h?: number
  source: 'coingecko' | 'jupiter' | 'cached'
  timestamp: Date
}

export interface JupiterTokenInfo {
  id: string
  name: string
  symbol: string
  icon?: string
  decimals: number
  twitter?: string
  telegram?: string
  website?: string
  dev?: string
  circSupply?: number
  totalSupply?: number
  tokenProgram?: string
  firstPool?: {
    id: string
    createdAt: string
  }
  holderCount?: number
  audit?: {
    mintAuthorityDisabled?: boolean
    freezeAuthorityDisabled?: boolean
    topHoldersPercentage?: number
  }
  organicScore?: number
  organicScoreLabel?: string
  tags?: string[]
  fdv?: number
  mcap?: number
  usdPrice?: number
  priceBlockId?: number
  liquidity?: number
  stats1h?: any
  stats6h?: any
  stats24h?: any
  ctLikes?: number
  updatedAt?: string
}