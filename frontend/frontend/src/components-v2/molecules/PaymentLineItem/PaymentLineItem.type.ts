import { PaymentStatus } from '@/api-v2/payment-api'
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

  contact: any
  token: { value: string; label: string }
  amount: string
  account: { value: string; label: string }
  note: string
  files: File[]
  draftStatus?: PaymentStatus

  // For add contact manually
  onInputChange: (value: string, action: InputActionMeta, index: number) => void
  onAccountChange: (account, index: number) => void
  onNoteChange: (note, index: number) => void
  onAmountChange: (amount, index: number) => void
  onContactChange: (contact, index: number) => void

  onFileChange: (file, index: number, action: 'add' | 'remove') => void
  onDownloadFile?: (file) => void
  onPreviewFile: (file) => void
  onTokenChange: (token, index: number) => void
  onSaveContact: (address: string, index: number) => void
  onCopyItem: (index: number) => void
  onRemoveItem: (index: number) => void
  onCreateRecipient?: () => void
  totalRecipients?: number
}
