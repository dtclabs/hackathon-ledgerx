// ===== DATA-ONCHAIN-INGESTOR INTEGRATION INTERFACES =====

export interface FinancialTransaction {
  transaction_id: string
  abstracted_index?: string
  hash?: string
  block_number?: number
  from_address?: string
  to_address?: string
  symbol?: string
  amount?: string
  fee?: string
  decimals?: number
  kind?: 'IN' | 'OUT'
  type?: string
  address?: string
  timestamp?: number
  index_address?: string
  blockchain_id?: string
  created_at?: string
  updated_at?: string
}

export interface TransactionFilters {
  symbol?: string
  kind?: 'IN' | 'OUT'
  type?: string
  address?: string
  from_block?: number
  to_block?: number
  from_time?: number
  to_time?: number
  exclude_wsol?: boolean
  limit?: number
  offset?: number
  sort?: 'block_number_desc' | 'block_number_asc' | 'created_at_desc' | 'created_at_asc'
}

export interface TransactionAggregate {
  index_address: string
  symbol: string
  address: string
  sum: string // Decimal as string
}

export interface TokenInfo {
  symbol: string
  name?: string
  description?: string
  image_url?: string
  owner?: string
  extra?: string
  decimals?: number
  address?: string
  is_spam?: boolean
  created_at?: string
  updated_at?: string
}

export interface TokenBalance {
  symbol: string
  address: string
  balance: string
  usd_value?: number
  formatted_balance?: string
}

export interface AddressCount {
  chain_id: string
  indexed_address: string
  financial_transaction_count?: number
}

export interface AddressJob {
  id: number
  chain_id: string
  run_id: string
  indexed_address: string
  status: number
  created_at: string
  updated_at: string
}

export interface AddressRegistry {
  register_id: string
  chain_id: string
  indexed_address: string
  status: number
  is_scheduled: boolean
  created_at: string
  updated_at: string
}

// ===== UI-SPECIFIC RESPONSE INTERFACES =====

export interface WalletTransactionHistory {
  wallet_id: string
  address: string
  chain_id: string
  total_transactions: number
  transactions: FinancialTransaction[]
  pagination: {
    current_page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface WalletPortfolio {
  wallet_id: string
  address: string
  chain_id: string
  total_usd_value: number
  balances: TokenBalance[]
  last_updated: string
  sync_status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'UNKNOWN'
}

export interface TransactionDetails {
  transaction: FinancialTransaction
  related_transactions?: FinancialTransaction[]
  metadata: {
    block_explorer_url?: string
    transaction_type_display: string
    fees_breakdown?: {
      network_fee: string
      platform_fee?: string
    }
  }
}

export interface WalletInsights {
  address: string
  chain_id: string
  summary: {
    total_transactions: number
    total_in: number
    total_out: number
    net_flow: number
    active_tokens: number
  }
  top_tokens: TokenBalance[]
  transaction_trends: {
    daily_count: Array<{ date: string; count: number }>
    weekly_volume: Array<{ week: string; volume: number }>
  }
}