import { PaymentStatus } from '@/api-v2/payment-api'
import { InputActionMeta } from 'react-select'
import { IPreviewFileRequest } from '@/api-v2/old-tx-api'

export interface IPaymentLineItem {
  index: number
  errors?: any
  removeDisabled?: boolean
  disabled?: boolean
  isAddRecipientDisabled?: boolean
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
  files: IPreviewFileRequest[]
  draftStatus?: PaymentStatus

  // For add contact manually
  onInputChange: (value: string, action: InputActionMeta, index: number) => void
  onAccountChange: (account, index: number) => void
  onNoteChange: (note, index: number) => void
  onAmountChange: (amount, index: number) => void
  onContactChange: (contact, index: number) => void
  onClickPreviewFile?: (uploadedFilename) => void
  onDownloadFile?: (uploadedFilename) => void
  onFileChange: (file, index: number, action: 'add' | 'remove') => void
  onTokenChange: (token, index: number) => void
  onSaveContact: (address: string, index: number) => void
  onCopyItem: (index: number) => void
  onRemoveItem: (index: number) => void
  onCreateRecipient?: () => void
  totalRecipients?: number
}
