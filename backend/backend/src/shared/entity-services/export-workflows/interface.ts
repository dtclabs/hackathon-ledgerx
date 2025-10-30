export enum ExportWorkflowType {
  SPOT_BALANCE = 'spot_balance'
}

export enum ExportWorkflowFileType {
  CSV = 'text/csv',
  PDF = 'application/pdf'
}

export enum ExportWorkflowStatus {
  CREATED = 'created',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type ExportWorkflowMetadata = SpotBalanceExportWorkflowMetadata

export enum SpotBalanceInterval {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export const spotBalanceIntervalName = {
  [SpotBalanceInterval.DAILY]: 'Daily',
  [SpotBalanceInterval.MONTHLY]: 'Monthly',
  [SpotBalanceInterval.QUARTERLY]: 'Quarterly',
  [SpotBalanceInterval.YEARLY]: 'Yearly'
}

export interface SpotBalanceExportWorkflowMetadata {
  query: {
    cryptocurrencyIds: string[]
    walletIds: string[]
    blockchainIds: string[]
    startDate: string
    endDate: string
    interval: SpotBalanceInterval
  }
}
