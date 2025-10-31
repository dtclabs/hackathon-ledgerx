import { ICompanyInfo, IDestinationAccount, IIndividualInfo, TripleARecipientType } from '@/hooks-v2/contact/type'

export interface IContactBankAccount {
  id: string
  bankName: string
  accountNumberLast4: string
  fiatCurrency: {
    name: string
    code: string
    symbol: string
    decimal: number
    image: string
  }
  recipientType: TripleARecipientType
  recipient: Partial<IIndividualInfo> | Partial<ICompanyInfo>
  destinationAccount: IDestinationAccount
}

interface IContactBankAccountPayload {
  destinationAccount: IDestinationAccount
  recipient: Partial<IIndividualInfo> | Partial<ICompanyInfo>
  recipientType: TripleARecipientType
}

export interface IGetContactBankAccounts {
  orgId: string
  contactId: string
  params?: any
}

export interface IGetContactBankAccount {
  orgId: string
  contactId: string
  id: string
}

export interface IPostContactBankAccount {
  orgId: string
  contactId: string
  payload: IContactBankAccountPayload
}

export interface IUpdateContactBankAccount {
  orgId: string
  contactId: string
  id: string
  payload: IContactBankAccountPayload
}
