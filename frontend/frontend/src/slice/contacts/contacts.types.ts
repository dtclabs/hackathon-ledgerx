import { ITime } from '@/api/interface'

export interface IRecipientAddress {
  address: string
  createdAt: string
  deletedAt: string | null
  id: string
  updatedAt: string
  blockchainId: string
  token: any
  cryptocurrency: any
}
export interface IRecipientContact {
  contactProvider: IContactProvider
  content: string
  createdAt: string
  deletedAt: string | null
  id: string
  updatedAt: string
}

export interface IContactProvider extends ITime {
  id: string
  name: string
}

export interface IContacts {
  id?: string
  publicId?: string
  organizationName: string
  organizationAddress: string
  type: EContactType
  contactName: string
  wallets: {
    blockchainId: string
    cryptocurrencySymbol: string
    address: string
  }[]
  contacts: {
    providerId: string
    content: string
  }[]
  recipientAddresses?: IRecipientAddress[]
  recipientContacts?: IRecipientContact[]
  bankAccounts?: IBankAccount[]
}

interface IBankAccount {
  id: string
  country?: string
  fiatCurrency?: string
  bankName?: string
  fullName?: string
  bankAccountNumber?: string
  BICCode?: string
}
export interface IPostContact {
  payload: IContacts
  orgId: string
  id?: string
  params?: any
}

export interface IDeleteContact {
  payload: {
    id: string
  }
  orgId: string
}

export enum EContactType {
  individual = 'individual',
  organization = 'organization'
}
