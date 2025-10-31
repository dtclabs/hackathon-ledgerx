export interface IRecentlyTransaction {
  hash: string

  isExecuted: boolean
  isProcessing?: boolean
  name: string
  account: string
  timestamp: any
  chain: number
  sender: string
  recipients?: any[]
  nonce?: string
  to?: string
}

export interface IRecipient {
  address: string
  amount: string
  tokenAddress?: string
  decimal: number
}

export interface ILiteSource {
  address: string
  balance?: string
  new?: boolean
}

export interface FreeState {
  recentlyTransactions: IRecentlyTransaction[]
  resetBalance: number
  resetMetamaskBalance: number
  error?: string | null
  sourceList: ILiteSource[]
  selectedSource?: ILiteSource
}
