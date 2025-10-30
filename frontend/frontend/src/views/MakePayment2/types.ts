export interface IWalletAddressItem {
  value: string
  label: string
  address: string
  src?: string
  chainId: string
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

export interface IRecipientItemForm {
  walletAddress: null | IWalletAddressItem
  chartOfAccounts?: IChartOfAccountItem
  note: string
  files: any
  s3Files?: any
  amount: string
  token: {
    publicId: string
    value: string
    label: string
    src: string
    address: string
    type: string
    decimal?: number
  }
  isUnknown?: boolean
  metadata?: { id: string; type: string }
  draftMetadata?: { id: string; status: string }
  source?: string
}

export interface IMakePaymentForm {
  notes: string
  files: any
  recipients: IRecipientItemForm[]
  sourceWallet: {
    address: string
    value: string
    label: string
    totalPrice: string
    type: string
    id: string
  }
}
