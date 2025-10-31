import { PaymentStatus } from '@/api-v2/payment-api'
import { IPreviewFileRequest } from '@/api-v2/old-tx-api'

export enum RecipientType {
  WALLET = 'wallet',
  RECIPIENT_ADDRESS = 'recipient_address',
  RECIPIENT_BANK_ACCOUNT = 'recipient_bank_account'
}

export interface IBankAccount {
  id: string
  accountNumber: string
  bankName: string
  countryCode: string
  label: string
  metadata: any
}

export interface IReviewItem {
  id: string
  walletAddress?: string
  bankAccount?: IBankAccount
  recipientName: string | null
  note: string | null
  files: any
  tags?: any
  draftStatus: PaymentStatus | null
  chartOfAccount: {
    id: string
    code: string
    name: string
    type: string
  }
  currency: {
    id: string
    image: string
    amount: string
    symbol?: string
    code?: string
  }
  draftMetadata: { status: PaymentStatus; id: string } | null
  // For fiat payment
  sourceCurrency?: {
    id: string
    image: string
    amount: string
    fiatPrice: number
    symbol?: string
  }
  quote?: {
    fee: string
    expiresAt: string
  }
}

export interface IRecipientItemForm {
  walletAddress?: string
  bankAccount?: IBankAccount
  chartOfAccountId: string | null
  note: string | null
  files: IPreviewFileRequest[] | null
  amount: string | null
  tokenId: string | null
  walletId?: string | null
  isUnknown: boolean
  metadata: { id: string; type: RecipientType } | null // If contact is mapped in system store data here
  draftMetadata: { status: PaymentStatus; id: string; isImported?: boolean } | null // This keeps track if item is from drafts or not
  annotations?: { value: string; label: string }[]
  purposeOfTransfer?: string
  // for fiat payment
  sourceAmount?: string
  sourceCurrency?: { image: any; name: string; symbol: string }
  quote?: { expiresAt: string; fee: string }
}

export interface IMakePaymentForm {
  recipients: IRecipientItemForm[]
  sourceWalletId: string | null
  remarks: string | null
}

interface DestinationMetadata {
  id: string
  type: RecipientType
}

interface Image {
  thumb: string
  small: string
  large: string
}

interface Cryptocurrency {
  name: string
  symbol: string
  image: Image
}
interface FiatCurrency {
  code: string
  src: string
  image: Image
}

interface CreatedBy {
  name: string
}

interface UpdatedBy {
  name: string
}

interface ReviewRequestedBy {
  name: string
}

interface ReviewedBy {
  name: string
}

// TODO - This should be in a better place
export interface IPaymentDraft {
  id: string
  blockchainId: string
  status: PaymentStatus
  paymentType: any // Type of paymentType is unknown
  hash: any // Type of hash is unknown
  safeHash: any // Type of safeHash is unknown
  notes: any // Type of notes is unknown
  destinationAddress: string
  destinationName: string | null
  destinationMetadata: DestinationMetadata
  destinationCurrency: Cryptocurrency & FiatCurrency
  // cryptocurrency: Cryptocurrency
  amount: string
  chartOfAccount: any // Type of chartOfAccount is unknown
  remarks: any // Type of remarks is unknown
  files: any[] // Array of unknown type
  createdAt: string
  updatedAt: string
  reviewRequestedAt: string
  reviewedAt: string
  executedAt: any // Type of executedAt is unknown
  failedAt: any // Type of failedAt is unknown
  createdBy: CreatedBy
  updatedBy: UpdatedBy
  reviewer: any // Type of reviewer is unknown
  reviewRequestedBy: ReviewRequestedBy
  reviewedBy: ReviewedBy
  executedBy: any // Type of executedBy is unknown
  contactName: string
  disabled: boolean
  isSelected: boolean
  tooltip: string
}
