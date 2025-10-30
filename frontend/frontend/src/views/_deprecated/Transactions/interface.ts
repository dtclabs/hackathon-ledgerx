import { ICategories } from '@/slice/categories/interfaces'
import { IPagination } from '@/api/interface'
import { ISource } from '@/slice/wallets/wallet-types'
import { IToken } from '@/hooks/useNetwork'
import { SafeBalanceResponse, SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { Dispatch, MouseEvent, SetStateAction } from 'react'
import { IMetamaskTransaction } from '../../SendPayment/interface'
import { ITransaction } from '@/slice/old-tx/interface'
import { IFilterItems } from '@/slice/old-tx/transactions-slide'

export interface ISafeTransactions {
  safeAddress: string
  nativeToken: string
  searchKey?: string
  setIsLoading: (isLoading: boolean) => void
  setCurrentSafeInfo: (currentSafeInfo: ISource) => void
  balances?: SafeBalanceResponse[]
  setBalances: (balances: SafeBalanceResponse[]) => void
}

export interface IAccountTransactionData {
  message: string
  result: any[]
  status: string | number
}

export interface IAccountTransactions {
  balances?: SafeBalanceResponse[]
  nativeToken: string
  searchKey?: string
}

export interface ISafeTransactionsTable {
  isExecuting: boolean
  account: string
  list: any[]
  searchKey?: string
  onItemClick?: (item) => void
  safeAddress: string
  balances?: SafeBalanceResponse[]
  nativeToken: string
  onExecute: (item, e) => void
  onSign: (item, e) => void
  safeInfo: any
  isTransactionSignedByAddress: (signerAddress: string, transaction: SafeMultisigTransactionResponse) => boolean
  isTransactionExecutable: (safeThreshold: number, transaction: SafeMultisigTransactionResponse) => boolean
}

export interface IOutGoingTransactions {
  price: any
  organizationId: string
  chainId: number
  tokens: IToken[]
  dataOutgoingTransactions: ITransaction[]
  totalPages: number
  setPage: (page: number) => void
  size: number
  currentPage: number
  totalItems: number
  setSearch: () => void
  isSource: (sourceId: string) => ISource
  categories: ICategories[]
  refetch?: () => void
  setShowImportFund: (data: boolean) => void
  sourceOfFunds: IPagination<ISource>
  account: any
  search: string
  control?: any
  loading: boolean
  isExportCsv: boolean
  setIsExportCsv: Dispatch<SetStateAction<boolean>>
  activeTab: string
  selectedList: ITransaction[]
  setSelectedList: Dispatch<SetStateAction<ITransaction[]>>
}
export interface IOutGoingTransactionsInfo {
  valuesOutgoingTransactions: ITransaction
  isSource: (address: string) => ISource
  categories: ICategories[]
  refetch?: () => void
  onSelectTransaction: (item: ITransaction) => void
  selectedList: ITransaction[]
  setSelectedList: (value: SetStateAction<ITransaction[]>) => void
  isLastItem: boolean
  isTableOverflowed: boolean
}
export interface IIncomingTransactions {
  isSource: (address: string) => ISource
  dataIncomingTransactions: ITransaction[]
  totalPages: number
  setPage: (page: number) => void
  size: number
  currentPage: number
  totalItems: number
  setSearch: () => void
  refetch: () => void
  categories: ICategories[]
  price: any
  tokens: IToken[]
  chainId: number
  setShowImportFund: (data: boolean) => void
  sourceOfFunds: IPagination<ISource>
  account: any
  search: string
  control?: any
  loading: boolean
  isExportCsv: boolean
  setIsExportCsv: Dispatch<SetStateAction<boolean>>
  activeTab: string
  selectedList: ITransaction[]
  setSelectedList: Dispatch<SetStateAction<ITransaction[]>>
}
export interface IIncomingTransactionsInfo {
  valuesIncomingTransactions: ITransaction
  loading?: boolean
  isSource: (address: string) => ISource
  refetch: () => void
  categories: ICategories[]
  onSelectTransaction: (item: ITransaction) => void
  selectedList: ITransaction[]
  notBorder?: boolean
  setSelectedList: (value: SetStateAction<ITransaction[]>) => void
  isLastItem: boolean
  isTableOverflowed: boolean
}

export interface IDataDecodedInput {
  address: string
  currentPrice: number
  pastPrice: number
  totalAmount: number
}
export interface IQueueTransactions {
  control?: any
  executeLoading: boolean
  nonExecuteLoading: boolean
  sourceOfFunds: IPagination<ISource>
  account: any
  confirmLoading: boolean
  chainId: number
  tokens: IToken[]
  price: any
  isTransactionSignedByAddress: (signerAddress: string, transaction: SafeMultisigTransactionResponse) => boolean
  search?: string
  isTransactionExecutable: (safeThreshold: number, transaction: SafeMultisigTransactionResponse) => boolean
  isSource: (address: string) => ISource
  pending: boolean
  dataQueueTransactions: ITransaction[]
  totalPages: number
  setPage: (page: number) => void
  size: number
  currentPage: number
  totalItems: number
  onReject: (transaction: ITransaction, sourceId: string, e: MouseEvent) => Promise<void>
  onSign: (transaction: ITransaction, sourceId: string, e: MouseEvent) => Promise<void>
  onExecuted: ({
    e,
    sourceId,
    transaction
  }: {
    transaction: ITransaction
    sourceId: string
    e: MouseEvent
  }) => Promise<void>
  setSearch: () => void
  refetch: () => void
  categories: ICategories[]
  setShowImportFund: (data: boolean) => void
  loading: boolean
  isExportCsv: boolean
  setIsExportCsv: Dispatch<SetStateAction<boolean>>
  activeTab: string
  selectedList: ITransaction[]
  setSelectedList: Dispatch<SetStateAction<ITransaction[]>>
}
export interface IQueueTransactionsInfo {
  nonExecuteLoading: boolean
  confirmLoading: boolean
  executeLoading: boolean
  onSelectTransaction: (item: ITransaction) => void
  selectedList: ITransaction[]
  isTransactionExecutable: (safeThreshold: number, transaction: SafeMultisigTransactionResponse) => boolean
  valuesQueueTransactions: ITransaction
  isSource: (address: string) => ISource
  isTransactionSignedByAddress: (signerAddress: string, transaction: SafeMultisigTransactionResponse) => boolean
  onReject: (transaction: ITransaction, sourceId: string, e: MouseEvent) => Promise<void>
  onSign: (transaction: ITransaction, sourceId: string, e: MouseEvent) => Promise<void>
  onExecuted: ({
    e,
    sourceId,
    transaction
  }: {
    transaction: ITransaction
    sourceId: string
    e: MouseEvent
  }) => Promise<void>
  refetch: () => void
  categories: ICategories[]
  index?: number
  setSelectedList: (value: SetStateAction<ITransaction[]>) => void
}
export interface IDraftTransactions {
  dataDraft: IMetamaskTransaction[]
  loading?: boolean
}

export interface IAllTransactions {
  control?: any
  handleResetAll: () => void
  handleResetDate: () => void
  isShowDropDown: boolean
  setIsShowDropDown: (isShowDropDown: boolean) => void
  isSource: (address: string) => ISource
  transactionLoading: boolean
  dataAllTransactions: ITransaction[]
  totalPages: number
  setPage: (page: number) => void
  size: number
  currentPage: number
  totalItems: number
  setSearch: () => void
  refetch: () => void
  categories: ICategories[]
  price: any
  chainId: number
  setShowImportFund: (data: boolean) => void
  sourceOfFunds: IPagination<ISource>
  account: string
  search?: string
  startDate: Date
  setStartDate: (date: Date) => void
  endDate: Date
  setEndDate: (date: Date) => void
  handleSubmit: () => void
  offset: string
  page: number
  activeTab: string
  isExportCsv: boolean
  isExportCsvXero: boolean
  setIsExportCsvXero: Dispatch<SetStateAction<boolean>>
  setIsExportCsv: Dispatch<SetStateAction<boolean>>
  filterItemsSelector: IFilterItems
  selectedList: ITransaction[]
  setSelectedList: Dispatch<SetStateAction<ITransaction[]>>
  selectedXeroList: ITransaction[]
  setSelectedXeroList: Dispatch<SetStateAction<ITransaction[]>>
}

export interface ICheckboxValue {
  [key: string]: string
}

export enum EFilterItem {
  FROM = 'from',
  TO = 'to',
  TOKEN_NAME = 'token name',
  CATEGORY = 'category',
  TYPE = 'type'
}
