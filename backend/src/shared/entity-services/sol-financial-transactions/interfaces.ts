import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { SolFinancialTransactionChild } from './sol-financial-transaction-child.entity'
import { SolFinancialTransactionParent } from './sol-financial-transaction-parent.entity'

// Parent Transaction Enums
export enum SolFinancialTransactionParentActivity {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  SWAP = 'SWAP',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  MINT = 'MINT',
  BURN = 'BURN',
  OTHER = 'OTHER'
}

export enum SolFinancialTransactionParentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum SolFinancialTransactionParentExportStatus {
  PENDING = 'PENDING',
  EXPORTED = 'EXPORTED',
  FAILED = 'FAILED'
}

// Child Transaction Enums
export enum SolFinancialTransactionChildMetadataDirection {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING'
}

export enum SolFinancialTransactionChildMetadataType {
  TOKEN_TRANSFER = 'TOKEN_TRANSFER',
  SOL_TRANSFER = 'SOL_TRANSFER',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  FEE = 'FEE',
  MINT = 'MINT',
  BURN = 'BURN',
  OTHER = 'OTHER'
}

export enum SolFinancialTransactionChildMetadataStatus {
  SYNCED = 'SYNCED',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED'
}

export enum SolFinancialTransactionChildMetadataSubstatus {
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  REQUIRES_MANUAL_REVIEW = 'REQUIRES_MANUAL_REVIEW'
}

export enum SolGainLossInclusionStatus {
  ALL = 'ALL',
  EXCLUDE = 'EXCLUDE',
  INCLUDE_ONLY_GAINS = 'INCLUDE_ONLY_GAINS',
  INCLUDE_ONLY_LOSSES = 'INCLUDE_ONLY_LOSSES'
}

// DTOs
export interface CreateSolFinancialTransactionParentDto {
  publicId: string
  hash: string
  blockchainId: string
  activity: SolFinancialTransactionParentActivity
  status: SolFinancialTransactionParentStatus
  exportStatus: SolFinancialTransactionParentExportStatus
  organizationId: string
  valueTimestamp: Date
  blockNumber?: number
  slot?: number
  fee?: string
  remark?: string
}

export interface CreateSolFinancialTransactionChildDto {
  publicId: string
  hash: string
  blockchainId: string
  fromAddress?: string
  toAddress?: string
  tokenAddress?: string
  cryptocurrency: Cryptocurrency
  cryptocurrencyAmount: string
  valueTimestamp: Date
  organizationId: string
  solFinancialTransactionParent: SolFinancialTransactionParent
  transactionId?: string
  instructionIndex?: number
  direction: SolFinancialTransactionChildMetadataDirection
  type: SolFinancialTransactionChildMetadataType
  status: SolFinancialTransactionChildMetadataStatus
  gainLossInclusionStatus: SolGainLossInclusionStatus
  solanaMetadata?: any
}

// Response DTOs
export interface SolFinancialTransactionSummaryDto {
  totalTransactions: number
  totalTokens: number
  dateRange: {
    from: Date
    to: Date
  }
}

export interface SolFinancialTransactionBalanceDto {
  tokenAddress: string
  symbol: string
  balance: string
  balanceInSOL?: string
  balanceInUSD?: string
}