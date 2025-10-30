import { createReducer, createSelector } from '@reduxjs/toolkit'
import { removeAccessToken } from '@/utils/localStorageService'
import { connectingWallet, logOut, showWelcome } from './actions'
import { AppState } from '..'

export enum ConnectingWalletEnum {
  Pending = 'pending',
  Done = 'done',
  None = 'none'
}
export interface UserState {
  connectingWallet: ConnectingWalletEnum
  isActive: boolean
  isAuthorized: boolean
  token: string
  showWelcome: boolean
}

export const initialState: UserState = {
  connectingWallet: ConnectingWalletEnum.None,
  token: '',
  isActive: false,
  isAuthorized: false,
  showWelcome: false
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(connectingWallet, (state, action) => {
      state.connectingWallet = action.payload as ConnectingWalletEnum
    })
    .addCase(logOut, (state) => {
      state.isActive = false
      state.isAuthorized = false
      state.token = ''
      removeAccessToken()
    })
    .addCase(showWelcome, (state, action) => {
      state.showWelcome = action.payload
    })
)

const selectSelf = (state: AppState) => state.user


const connectingWalletSelector = createSelector(selectSelf, (state) => state.connectingWallet)

const showWelcomeSelector = createSelector(selectSelf, (state) => state.showWelcome)

export const userSelectors = {
  connectingWalletSelector,
  showWelcomeSelector
}
