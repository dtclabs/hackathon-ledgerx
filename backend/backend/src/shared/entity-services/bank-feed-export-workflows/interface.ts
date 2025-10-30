export enum BankFeedExportFileType {
  CSV = 'text/csv'
  // COF
}

export enum BankFeedExportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface BankFeedExportWorkflowMetadata {
  blockchainId: string
  walletId: string
  cryptocurrencyId: string
  startTime: Date
  endTime: Date
}
