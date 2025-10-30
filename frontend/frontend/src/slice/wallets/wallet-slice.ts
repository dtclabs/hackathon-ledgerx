import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/api-v2'

export interface IWalletState {
  isSyncing: boolean
  lastSyncedAt: string
  wallets: any
}

const initialState: IWalletState = {
  isSyncing: false,
  lastSyncedAt: '',
  wallets: []
}

export const walletSlice = createSlice({
  name: 'wallet-slice',
  initialState,
  reducers: {
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload
    },
    setLastSyncedAt: (state, action: PayloadAction<string>) => {
      state.lastSyncedAt = action.payload
    },
    resetWallet: (state) => {
      state.wallets = []
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getWallets.matchFulfilled,
      (state, { payload }) => {
        state.wallets = payload?.items || []
      }
    )
  }
})

export const { setSyncing, setLastSyncedAt, resetWallet } = walletSlice.actions
