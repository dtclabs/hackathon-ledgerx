export enum PayoutType {
  DISPERSE = 'disperse',
  SAFE = 'safe'
}

export enum PayoutStatus {
  EXECUTED = 'executed',
  SYNCED = 'synced'
}

export interface PayoutMetadata {
  method?: any
  metamaskTransaction?: any
  safeTransaction?: any
}

export interface LineItem {
  address: string
  cryptocurrencyId: string
  amount: string
  chartOfAccountId: string
  notes: string
  files: string[]
}
