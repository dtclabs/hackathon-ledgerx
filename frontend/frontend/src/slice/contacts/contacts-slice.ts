import { api } from '@/api-v2'
import { AppState } from '@/state'
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { IContactProvider, IContacts } from './contacts.types'
import { IContactBankAccount } from '../contact-bank-accounts/contact-bank-accounts-types'

interface IContactState {
  contacts: IContacts[]
  contactProviders: IContactProvider[]
  contactBankAccounts: IContactBankAccount[]
  bankList: any[]
  bankLoading: boolean
}

const initialState: IContactState = {
  contacts: [],
  contactProviders: [],
  contactBankAccounts: [],
  bankList: [],
  bankLoading: false
}

export const contactsSlice = createSlice({
  name: 'contact-slice',
  initialState,
  reducers: {
    setContactBankAccounts: (state, action: PayloadAction<IContactBankAccount[]>) => {
      state.contactBankAccounts = action.payload
    },
    setBankList: (state, action: PayloadAction<any[]>) => {
      state.bankList = action.payload
    },
    setBankLoading: (state, action: PayloadAction<boolean>) => {
      state.bankLoading = action.payload
    }
  },
  extraReducers: (builder) => {
    // builder.addMatcher(
    //   // @ts-ignore
    //   api.endpoints.getBanks.matchFulfilled,
    //   (state, { payload }) => {
    //     state.bankList = payload
    //   }
    // )
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getContacts.matchFulfilled,
      (state, { payload }) => {
        state.contacts = payload
      }
    )
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getContactProvider.matchFulfilled,
      (state, { payload }) => {
        state.contactProviders = payload
      }
    )
  }
})

const selectSelf = (state: AppState) => state.contacts

export const contactsSelector = createSelector(selectSelf, (state) => state.contacts?.items)
export const contactProvidersSelector = createSelector(selectSelf, (state) => state.contactProviders)
export const contactBankAccountsSelector = createSelector(selectSelf, (state) => state.contactBankAccounts)
export const bankListSelector = createSelector(selectSelf, (state) => state.bankList)
export const bankLoadingSelector = createSelector(selectSelf, (state) => state.bankLoading)

export const { setContactBankAccounts, setBankList, setBankLoading } = contactsSlice.actions
