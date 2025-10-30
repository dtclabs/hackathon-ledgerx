export interface IParsedQueuedTransaction {
  blockchainId: string
  confirmations: ITransactionConfirmations[]
  confirmationsRequired: number
  cryptocurrencies: ITransactionCryptoCurrency[]
  fiatCurrencyData: ITransactionFiatCurrency
  fiatTotalAmount: number
  id: string
  isFinishedParsingData: boolean // TODO - Change this
  isQueued: boolean
  isRejected: boolean
  isTransactionExecutable: boolean
  isExecutedByConnectedAccount: boolean
  nonce: number
  notes: string | null
  recipients: IRecipient[]
  safeHash: string
  safeTransaction: any
  submissionDate: string
  wallet: ITransactionWallet
  isConnectedAccountOwner: boolean
}

export interface ITransactionConfirmations {
  owner: string
  signatureType: string
  ownerContact: any
  submissionDate: string
  transactionHash: any
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

// TODO - This can be imported from recipient?
interface IRecipient {
  address: string
  contact: any
  cryptocurrency: any
  cryptocurrencyAmount: string
  fiatAmount: string
  fiatAmountPerUnit: string
  fiatCurrency: string
}

interface ITransactionWallet {
  address: string
  id: string
  threshold: number
  metadata: {
    blockchainId: string
    threshold: number
    nonce: number
    ownerAddresses: { name: string; address: string; state: string }[]
  }
}
