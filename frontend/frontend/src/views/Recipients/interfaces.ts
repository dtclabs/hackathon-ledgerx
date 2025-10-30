import { IContactProvider, IContacts } from '@/slice/contacts/contacts.types'
import { IChain } from '@/slice/platform/platform-slice'
import {
  Control,
  DeepRequired,
  FieldArrayWithId,
  FieldErrorsImpl,
  UseFieldArrayAppend,
  UseFieldArrayReplace,
  UseFormRegister
} from 'react-hook-form'
import { IMetamaskTransaction } from '../SendPayment/interface'
import { IAddRecipient } from './components/AddNewRecipientModal/AddNewRecipientModal'
import { IRecipientListItem } from './components/RecipientList/RecipientListItem'

export enum ChangeAction {
  ADD = 'add',
  EDIT = 'edit',
  DELETE = 'delete'
}

export interface IRecipientList {
  dataRecipient: IRecipientListItem[]
  onShowDetailModal: (item) => void
  onCheckboxChange: (id: string) => void
  setTotalCheck: (checked: boolean) => void
  totalCheck: boolean
}

export interface IRecipientItem extends IContacts {
  address: string
  id: string
  name: string
  active: boolean
  time: string
  checked: boolean
}
// export interface IRecipientDetailModal {
//   // setShowModal: React.Dispatch<React.SetStateAction<boolean>>
//   // recipient: IRecipientItem
//   // showModal: boolean
//   // onDelete: React.MouseEventHandler<HTMLButtonElement>
//   // onEdit: (data: IAddRecipient) => void
// }

export enum ESocialMedia {
  EMAIL = 'email',
  TELEGRAM = 'telegram',
  TWITTER = 'twitter',
  WALLET = 'wallet'
}

export interface ITransactionInQueueTab {
  dataListQueue: IDataListQueue[]
}

export interface IDataListQueue extends IMetamaskTransaction {
  id: string
  status: string
  subStatus: string
  method: string
  time: string
  amount: string
  price: string
  category: string
}
export enum EStatus {
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  REJECTED = 'Rejected'
}

export interface IContactPerson {
  requiredField: boolean
  providerFieldsWatch?: {
    providerId?: string
    content?: string
  }[]
  getImageToken?: any
  walletFieldsWatch?: {
    blockchainId?: string
    cryptocurrencySymbol?: string
    walletAddress?: string
    disabled?: boolean
  }[]
  contactProviders: IContactProvider[]
  control: Control<IAddRecipient, any>
  errors: FieldErrorsImpl<DeepRequired<IAddRecipient>>
  apiError: string
  walletFields: FieldArrayWithId<IAddRecipient, 'wallets' | 'providers', 'id'>[]
  providerFields: FieldArrayWithId<IAddRecipient, 'providers' | 'wallets', 'id'>[]
  register: UseFormRegister<IAddRecipient>
  providerReplace: UseFieldArrayReplace<IAddRecipient, 'providers' | 'wallets'>
  providerAppend: UseFieldArrayAppend<IAddRecipient, 'providers' | 'wallets'>
  providerRemove: (index?: number | number[]) => void
  chainItems: any
  walletReplace: UseFieldArrayReplace<IAddRecipient, 'providers' | 'wallets'>
  walletAppend: UseFieldArrayAppend<IAddRecipient, 'providers' | 'wallets'>
  tokenItems: any
  walletRemove: (index?: number | number[]) => void
  getSelectToken: (tokenId: string, chainId: string) => any
  getSelectChain: (chainId: string) => any
  getSelectProvider: (providerId: string) => IContactProvider
  watch: any
  className?: string
  disabled?: boolean
  currentChainId?: number
  selectedChain: IChain
}
