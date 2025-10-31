export interface IBankFeedParams {
  wallet: { value: string; label: string }
  blockChain: { value: string; label: string }
  date: { startDate: Date; endDate: Date }
  assets: { value: string; label: string }[]
}

export interface IExportPayLoad {
  exportMethod: ExportMethod
  exportTo: ExportTo
  exportType?: ExportType
  walletId?: string
  blockchainId?: string
  assetIds?: string[]
  startTime?: Date
  endTime?: Date
}

export interface IExportModalV2 {
  provider: any
  onClickPrimary: (payload: IExportPayLoad) => void
  filteredItems: number
  selectedItems: number
  prerequisitesErrors: any[]
  isLoading: boolean
  isFetching: boolean
  modifiedCoaQuery: any
  accountingIntegration: any
  walletList: any[]
}

export enum ExportMethod {
  TRANSACTIONS = 'export-transactions',
  REPORT = 'export-report',
  JOURNAL_ENTRIES = 'export-journey-entries',
  BANK_FEEDS = 'export-bank-feeds'
}

export enum ExportTo {
  CSV = 'text/csv',
  PDF = 'application/pdf',
  XERO = 'xero',
  QUICK_BOOKS = 'quickbooks'
}

export const FILE_TYPE = {
  [ExportTo.CSV]: 'CSV',
  [ExportTo.PDF]: 'PDF'
}

export enum ExportType {
  ALL = 'all',
  SELECTION = 'selection'
}

export const EXPORT_METHOD_OPTIONS = [
  { value: ExportMethod.TRANSACTIONS, label: 'Transactions', disabled: false, tooltip: '' },
  { value: ExportMethod.JOURNAL_ENTRIES, label: 'Journal Entries', disabled: false, tooltip: '' },
  { value: ExportMethod.BANK_FEEDS, label: 'Bank Feeds', disabled: false, tooltip: '' }
]

export const EXPORT_COLUMNS = [
  'Date & Time',
  'Txn Hash',
  'Type',
  'From Wallet',
  'To Wallet',
  'Token Name',
  'Token Amount in',
  'Token Amount Out',
  'Fiat Value In',
  'Fiat Value Out',
  'Realised Gains/Loss',
  'Account',
  'Notes',
  'Blockchain'
]
