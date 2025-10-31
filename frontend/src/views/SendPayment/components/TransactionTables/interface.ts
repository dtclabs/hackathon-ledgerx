import {
  SafeBalanceResponse,
  SafeInfoResponse,
  SafeMultisigTransactionListResponse
} from '@gnosis.pm/safe-service-client'
import { IMetamaskTransaction } from '../../interface'

export interface ITransactionTables {
  price: any
  active: string
  organization: any,
  balances: SafeBalanceResponse[]
  list: any[]
  page: number
  error: string
  expandList: any[]
  totalCount: number
  showError: boolean
  sourceList: string[]
  sourceAddress: string
  metamaskHistory: any[]
  transactionDetail: any
  refreshLoading: boolean
  currentTableData: any[]
  showTransaction: boolean
  totalTransactions: any[]
  expandListHistory: any[]
  totalCountHistory: number
  setMetamaskTransactions: any
  source: SafeInfoResponse | null
  currentTableDataHistory?: any[]
  showTransactionMetaMask: boolean
  executedTran: any
  availableSourceList: any[]
  onRefresh: () => void
  onSign: (item, e) => void
  onExecuted: (item, e) => void
  onShowImportModal: () => void
  setPage: (page: number) => void
  setError: (error: string) => void
  setActive: (active: string) => void
  setShowError: (show: boolean) => void
  onShowTransaction: (item: any) => void
  setShowTransaction: (show: boolean) => void
  onReject: (transaction: any, e: any) => void
  onShowTransactionMetaMask: (item: any) => void
  toggleExpandTransaction: (hash: string) => void
  setShowTransactionMetaMask: (item: any) => void
  setConnectError: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ITransactionQueue {
  totalCount: number
  sourceAddress: string
  sourceList: string[]
  balances?: SafeBalanceResponse[]
  source: SafeInfoResponse
  currentTableData: any[]
  list: SafeMultisigTransactionListResponse[] | any[]
  totalTransactions: any[]
  page: number
  price: any
  expandList: any[]
  onReject: (trans: any, e: any) => void
  onShowImportModal: () => void
  onSign: (item: any, e: any) => void
  onExecuted: (item: any, e: any) => void
  onShowTransaction: (item) => void
  setPage: (page: number) => void
  toggleExpandTransaction: (hash: string) => void
  setError: (error: string) => void
  setShowError: (error: boolean) => void
}
export interface ITransactionHistory {
  account?: string
  totalCount: number
  sourceAddress: string
  sourceList: string[]
  currentTableData: any[]
  page: number
  expandList: any[]
  currentTableDataHistory: any[]
  queue?: any[]
  price: any
  totalCountHistory: number
  expandListHistory: any[]
  metamaskHistory: any[]
  setMetamaskTransactions: any
  executedTran: any
  onShowTransaction: (item) => void
  setPage: (page: number) => void
  toggleExpandTransaction: (hash: string) => void
  setError: (error: string) => void
  setShowError: (error: boolean) => void
  onShowTransactionMetaMask: (item) => void
  setConnectError: React.Dispatch<React.SetStateAction<boolean>>
}

export const transactionTabs = [
  {
    key: 'TransactionHistory',
    name: 'Payments',
    active: true
  },
  {
    key: 'TransactionQueue',
    name: 'Payment Queue',
    active: false
  }
]
