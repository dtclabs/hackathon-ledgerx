import { CurrencyType } from '@/api-v2/payment-api'

interface IWalletAddressItem {
  value: string
  label: string
  address?: string
  src?: string
  chainId?: string
  accountNumber?: string
  currencyCode?: string
  metadata?: {
    id: string
    type: string
  }
  isUnknown?: boolean
}

interface IChartOfAccountItem {
  value: string
  label: string
  code?: string
  name: string
  type: string
}

interface IAddressItem {
  address: string
  blockchainId: string
  decimal: number
  type: string
  label: string
  src: string
  value: string
}

export interface ICreateDraftForm {
  recipients: IDraftRecipientForm[]
  reviewer: string
  isSubmitForReview: boolean
}

export interface IDraftRecipientForm {
  walletAddress: null | Partial<IWalletAddressItem>
  chartOfAccounts?: IChartOfAccountItem
  note: string
  files: any
  annotations?: { value: string; label: string }[]
  s3Files?: any
  amount: string
  token: {
    publicId?: string
    value: string
    label: string
    src: string
    address?: IAddressItem
  }
  tokenId?: string | null
  purposeOfTransfer?: string
  destinationCurrencyType: CurrencyType
}
