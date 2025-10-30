import { AppState } from '@/state'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type IAuthType = 'google' | 'email' | 'wallet' | 'xero'

export interface IAuthState {
  isAuthenticated: boolean
  accessToken: string
  type: IAuthType | null
  userInfo: { firstName: string; lastName: string; email: string }
}

const initialState: IAuthState = {
  isAuthenticated: false,
  type: null,
  accessToken: '',
  userInfo: { firstName: '', lastName: '', email: '' }
}

export const authSlice = createSlice({
  name: 'auth-slice',
  initialState,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },
    setAuthType: (state, action: PayloadAction<IAuthType>) => {
      state.type = action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    setUserInfo: (state, action: PayloadAction<{ firstName: string; lastName: string; email: string }>) => {
      state.userInfo = action.payload
    }
  }
})

export const { setAccessToken, setAuthType, setIsAuthenticated, setUserInfo } = authSlice.actions

const selectSelf = (state: AppState) => state.auth

export const accessTokenSelector = createSelector(selectSelf, (state) => state.accessToken)
export const userInfoSelector = createSelector(selectSelf, (state) => state.userInfo)
export const authTypeSelector = createSelector(selectSelf, (state) => state.type)
