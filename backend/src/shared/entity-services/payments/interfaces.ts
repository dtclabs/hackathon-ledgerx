import { TripleAPurposeOfRemittance, TripleAQuoteResponse } from '../../../domain/integrations/triple-a/interfaces'

export enum PaymentType {
  DISPERSE = 'disperse',
  SAFE = 'safe'
}

export enum PaymentStatus {
  PREVIEW = 'preview',
  CREATED = 'created',
  PENDING = 'pending',
  INVALID = 'invalid',
  APPROVED = 'approved',
  EXECUTING = 'executing',
  EXECUTED = 'executed',
  FAILED = 'failed',
  SYNCED = 'synced'
}

export enum DestinationType {
  WALLET = 'wallet',
  RECIPIENT_ADDRESS = 'recipient_address',
  RECIPIENT_BANK_ACCOUNT = 'recipient_bank_account'
}

export enum CurrencyType {
  FIAT = 'fiat',
  CRYPTO = 'crypto'
}

export enum PaymentProvider {
  HQ = 'hq',
  TRIPLE_A = 'triple_a',
  GNOSIS_SAFE = 'gnosis_safe'
}

export enum ProviderStatus {
  CREATED = 'created',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface PaymentMetadata {
  method?: unknown
  metamaskTransaction?: unknown
  safeTransaction?: unknown
  purposeOfTransfer?: TripleAPurposeOfRemittance
  quote?: TripleAQuoteResponse
  proposedTransactionHash?: string
}

export interface DestinationMetadata {
  id: string
  type: DestinationType
  bankName?: string
  accountNumberLast4?: string
}

export interface Recipient {
  destinationName: string
  destinationAddress: string
}
