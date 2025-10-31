import { IToken } from '@/hooks/useNetwork'
import { ICategories } from '../categories/interfaces'
import { IGetAllOptions } from '../../api/interface'
import { ISource, SourceType } from '../wallets/wallet-types'

interface MetamaskTransaction {
  hash: string
  functionName: string

  blockNumber: string
  timeStamp: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txReceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
}

export enum ETransactionType {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
  QUEUE = 'queue',
  DRAFT = 'draft',
  ALL = 'all'
}

export interface IGetTransactionQuery extends IGetAllOptions {
  type?: ETransactionType
  chainId?: number
  lastDays?: number
  startTime?: string
  endTime?: string
  categoryIds?: string
  symbols?: string
  fromAddress?: string
  toAddress?: string
}

export interface IGetTransactionXeroQuery extends IGetAllOptions {
  chainId?: number
  lastDays?: number
  startTime?: string
  endTime?: string
  symbols?: string
  sourceId?: number
  categoryIds?: string
  minRange?: number
  maxRange?: number
  search?: string
  fromAddress?: string
  toAddress?: string
}

interface SafeTransaction {
  baseGas: number
  tokenInfo: ITokenInfo
  tokenAddress: string
  from: string
  tokenId: string
  timestamp: string
  hash: string
  blockNumber: number
  confirmations: Array<IConfirmation | any>
  confirmationsRequired: number
  data: string
  dataDecoded: any
  ethGasPrice: string
  executionDate: string
  executor: string
  fee: string
  gasPrice: string
  gasToken: string
  gasUsed: number
  isExecuted: boolean
  isSuccessful: boolean
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  modified: string
  nonce: number
  operation: number
  origin: string
  refundReceiver: string
  safe: string
  safeTxGas: number
  safeTxHash: string
  signatures: string
  submissionDate: string
  to: string
  transactionHash: string
  trusted: boolean
  value: string
}

export interface IConfirmation {
  owner: string
  submissionDate: string
  transactionHash: string | null
  signature: string
  signatureType: string
}

interface ITokenInfo {
  type: string
  address: string
  name: string
  symbol: string
  decimals: number
  logoUri: string
}

export interface ITransaction {
  id: string
  isIncoming?: boolean
  comment: string
  method?: string
  tags?: null
  hash: string
  safeHash: string | null
  timeStamp: string
  isExecuted: boolean
  submissionDate: string | null
  metamaskTransaction: MetamaskTransaction | null
  safeTransaction: SafeTransaction | null
  isDraft: null
  source?: ISource // TODO: Remove
  wallet: ISource
  recipients?: ITransactionRecipient[]
  tokenAddress?: string
  amount?: string
  blockchainId: string
  currentUSDPrice?: number
  pastUSDPrice?: number
  gasUsed?: number
  gasPrice?: number
  isRejectTransaction?: boolean
  decimal?: number
  symbol?: string
  token?: IToken
  from?: string
  to?: string
  fee?: string
  isContractInteraction?: boolean
  dataDecoded?: any
  currentNonce?: number
  categories?: ICategories[]
  draftTransaction?: IDraftTransaction[]
  type?: ETransactionType
  files?: string[]
  pastUSDGasFee?: string
  isReady?: boolean
  notAnOwner?: boolean
  notes?: string
}

export interface ITransactionRecipient {
  address: string
  amount?: string
  currentUSDPrice?: number
  pastUSDPrice?: number
  cryptocurrencyAmount?: string
  fiatAmount?: string
  cryptocurrency?: any
  fiatCurrency?: string
  notes?: string
  chartOfAccount?: any
  files?: any
}

export interface ICreateTransaction {
  blockchainId: string
  hash?: string
  safeHash?: string
  comment?: string
  tags?: string[]
  categories?: string[]
  sourceId: string
  sourceAddress: string
  isDraft: boolean
  draftTransaction?: IDraftTransaction[]
  safeTransaction?: SafeTransaction | null
  recipients: ITransactionRecipient[]
  functionName?: string
  type: SourceType
  symbol?: string
  confirmationsRequired?: number
  files?: string[]
}

export interface ISyncPayload {
  safeHash: string
  chainId: number
  nonce: number
  confirmationsRequired: number
  sourceId: string
  sourceAddress: string
  recipients: ITransactionRecipient[]
  symbol: string
  isExecuted?: boolean
  hash?: string
}

interface IDraftTransaction {
  address: string
  token: string
  amount: string
}
export interface IUpdateInfoTransaction {
  comment?: string
  categories?: string[]
  draftTransaction?: IDraftTransaction[]
  files?: string[]
}

export interface IListFilterAddresses {
  from: IListFromTo[]
  to: IListFromTo[]
}

interface IListFromTo {
  name: string
  address: string
  chain: any
  token?: IToken
}
