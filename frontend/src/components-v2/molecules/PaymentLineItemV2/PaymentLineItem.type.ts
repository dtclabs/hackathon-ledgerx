import { IPreviewFileRequest } from '@/api-v2/old-tx-api'
import { PaymentStatus } from '@/api-v2/payment-api'
import { ITagHandler } from '@/views/Transactions-v2/interface'
import { InputActionMeta } from 'react-select'

export interface IPaymentLineItem {
  index: number
  errors?: any
  removeDisabled?: boolean
  disabled?: boolean

  contactOptions: any[]
  accountOptions: {
    label?: string
    options?: unknown
    value?: any
  }[]
  tokenOptions: { value: string; label: string }[]

  isLoading?: boolean
  contact: any
  token: { value: string; label: string }
  amount: string
  account: { value: string; label: string }
  purposeTransfer?: string
  note: string
  files: IPreviewFileRequest[]
  annotations: { value: string; label: string }[]
  draftStatus?: PaymentStatus

  purposeOfTransferOptions?: {
    label?: string
    value?: any
  }[]

  // For add contact manually
  onInputChange?: (value: string, action: InputActionMeta, index: number) => void
  onAccountChange: (account, index: number) => void
  onPurposeTransferChange?: (purpose, index: number) => void
  onNoteChange: (note, index: number) => void
  onAmountChange: (amount, index: number) => void
  onContactChange: (contact, index: number) => void
  onFileChange: (file, index: number, action: 'add' | 'remove') => void
  onPreviewFile: (file) => void
  onDownloadFile?: (file) => void
  onTokenChange: (token, index: number) => void
  onSaveContact?: (address: string, index: number) => void
  onCopyItem: (index: number) => void
  onRemoveItem: (index: number) => void
  onCreateRecipient?: () => void
  totalRecipients?: number
  tagsHandler: ITagHandler
  isAddRecipientDisabled?: boolean
}
