import { IRecipient, IWallet, IConfirmation, ISafeTransaction } from './pending-transactions.types'

export interface IGetPendingTransactionsParams {
  organizationId: string
  params: {
    walletIds?: string[]
    blockchainIds?: string[]
  }
}

export interface IGetPendingTransactionsResponse {
  data: IPendingTransaction[]
}

export interface IPendingTransaction {
  id: string
  safeHash: string
  blockchainId: string
  recipients: IRecipient[]
  submissionDate: string
  nonce: number
  wallet: IWallet
  confirmationsRequired: number
  confirmations: IConfirmation[]
  safeTransaction: ISafeTransaction
  notes: string | null
  type: string
}

// TODO - This can be imported from cyrptocurrency?
interface ITransactionCryptoCurrency {
  image: string
  name: string
  symbol: string
  totalCryptocurrencyAmount: number
}

// TODO - This can be imported from org settings?
interface ITransactionFiatCurrency {
  code: string // "SGD | USD"
  decimals: number
  iso: string // "SG"
  symbol: string // "$"
}

export interface IParsedPendingTransaction extends IPendingTransaction {
  cryptocurrencies: ITransactionCryptoCurrency[]
  fiatCurrencyData: ITransactionFiatCurrency
  fiatTotalAmount: number
  isFinishedParsingData: boolean // TODO - Change this
  isQueued: boolean
  isRejected: boolean
  isTransactionExecutable: boolean
  isExecutedByConnectedAccount: boolean
  isConnectedAccountOwner: boolean
  isUnknown?: boolean
}


