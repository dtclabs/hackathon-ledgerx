import { IPagination } from '@/api/interface'
import { ISource } from '@/slice/wallets/wallet-types'
import { IToken } from '@/hooks/useNetwork'
import { ITransaction } from '@/slice/old-tx/interface'
import { SafeBalanceResponse, SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { Dispatch, MouseEvent, SetStateAction } from 'react'


export interface IParsedQueuedTransaction {
  blockchainId: string
  confirmations: ITransactionConfirmations[]
  confirmationsRequired: any
  id: string
  isRejected: boolean
  isQueued: boolean
  nonce: number
  notes: string
  recipients: any
  safeHash: string
  safeTransaction: any
  submissionDate: string
  wallet: any
  isFinishedParsingData: boolean
  isConnectedAccountOwner: boolean
  cryptocurrencies: any[]
  fiatTotalAmount: number
  fiatCurrencyData: any
  isExecutedByConnectedAccount: boolean
  isTransactionExecutable: boolean
}

export interface ITransactionConfirmations {
  owner: string
  signatureType: string
  ownerContact: any
  submissionDate: string
  transactionHash: any
}

export interface ISafeTransactions {
  safeAddress: string
  nativeToken: string
  searchKey?: string
  setIsLoading: (isLoading: boolean) => void
  setCurrentSafeInfo: (currentSafeInfo: ISource) => void
  balances?: SafeBalanceResponse[]
  setBalances: (balances: SafeBalanceResponse[]) => void
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

export interface IDataDecodedInput {
  address: string
  currentPrice: number
  pastPrice: number
  totalAmount: number
}
export interface IQueueTransactions {
  onClickRow?: (item) => void
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
  totalPages?: number
  setPage: (page: number) => void
  size: number
  currentPage: number
  totalItems?: number
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
  // categories: ICategories[]
  setShowImportFund: (data: boolean) => void
  loading: boolean
  isExportCsv: boolean
  setIsExportCsv: Dispatch<SetStateAction<boolean>>
  selectedList: ITransaction[]
  setSelectedList: Dispatch<SetStateAction<ITransaction[]>>
}
export interface IQueueTransactionsInfo {
  onClickRow?: (item) => void
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
  // categories: ICategories[]
  index?: number
  setSelectedList: (value: SetStateAction<ITransaction[]>) => void
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



export interface IGnosisTransactionInfo {
  safe: string
  to: string
  value: string
  data: string | null
  operation: number
  gasToken: string
  safeTxGas: number
  baseGas: number
  gasPrice: string
  refundReceiver: string
  nonce: number
  executionDate: string | null
  submissionDate: string
  modified: string
  blockNumber: number | null
  transactionHash: string | null
  safeTxHash: string
  proposer: string
  executor: string | null
  isExecuted: boolean
  isSuccessful: boolean | null
  ethGasPrice: string | null
  maxFeePerGas: string | null
  maxPriorityFeePerGas: string | null
  gasUsed: number | null
  fee: number | null
  origin: string
  dataDecoded: any | null // Replace 'any' with a more specific type if the structure is known
  confirmationsRequired: number
  confirmations: IGnosisConfirmation[]
  trusted: boolean
  signatures: any | null // Replace 'any' with a more specific type if the structure is known
}

interface IGnosisConfirmation {
  owner: string
  submissionDate: string
  transactionHash: string | null
  signature: string
  signatureType: string
}
