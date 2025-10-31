export interface IRecipient {
  address: string
  contact: string | null
  cryptocurrencyAmount: string
  fiatAmount: string
  fiatAmountPerUnit: string
  fiatCurrency: string
  cryptocurrency: Cryptocurrency
}

interface Cryptocurrency {
  name: string
  publicId: string
  symbol: string
  image: CryptocurrencyImage
  isVerified: boolean
  addresses?: CryptocurrencyAddress[]
}

interface CryptocurrencyImage {
  thumb: string
  small: string
  large: string
}

interface CryptocurrencyAddress {
  blockchainId: string
  type: string
  decimal: number
  address: string | null
}

export interface IWallet {
  id: string
  name: string
  address: string
  sourceType: string
  flaggedAt: string | null
  group: any
  balance: WalletBalance
  status: string
  metadata: WalletMetadata
  lastSyncedAt: string
  createdAt: string
  supportedBlockchains: string[]
  ownedCryptocurrencies: { [key: string]: any[] }
}

interface WalletBalance {
  lastSyncedAt: string
  blockchains: { [key: string]: Blockchain[] }
}

interface Blockchain {
  cryptocurrency: Cryptocurrency
  cryptocurrencyAmount: string
  fiatCurrency: string
  fiatAmount: string
}

interface WalletMetadata {
  blockchainId: string
  threshold: number
  nonce: number
  ownerAddresses: OwnerAddress[]
}

interface OwnerAddress {
  name: string
  address: string
  state: string
}

export interface IConfirmation {
  owner: string
  submissionDate: string
  transactionHash: string | null
  signatureType: string
  ownerContact: OwnerContact
}

interface OwnerContact {
  organizationId: string
  name: string
  type: string
  typeId: string
  addresses: OwnerAddress[]
}

export interface ISafeTransaction {
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
  blockNumber: string | null
  transactionHash: string | null
  safeTxHash: string
  proposer: string
  executor: string | null
  isExecuted: boolean
  isSuccessful: boolean | null
  ethGasPrice: string | null
  maxFeePerGas: string | null
  maxPriorityFeePerGas: string | null
  gasUsed: string | null
  fee: string | null
  origin: string
  dataDecoded: DataDecoded | null
  confirmationsRequired: number
  confirmations: IConfirmation[]
  trusted: boolean
  signatures: string | null
}

interface DataDecoded {
  method: string
  parameters: DecodedParameter[]
  valueDecoded?: DecodedValue[]
}

interface DecodedParameter {
  name: string
  type: string
  value: string
  valueDecoded?: DecodedValue[]
}

interface DecodedValue {
  operation: number
  to: string
  value: string
  data: string | null
  dataDecoded: DataDecoded | null
}
