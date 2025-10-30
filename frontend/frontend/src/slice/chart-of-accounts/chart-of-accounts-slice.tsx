import { AppState } from '@/state'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { chartOfAccountsApi } from '@/api-v2/chart-of-accounts'

export interface IChartOfAccountState {
  accounts: any
}

const initialState: IChartOfAccountState = {
  accounts: [],
}

export const chartOfAccountSlice = createSlice({
  name: 'chart-of-accounts-slice',
  initialState,
  reducers: {
    setChartOfAccounts: (state, action: PayloadAction<any>) => {
      state.accounts = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      chartOfAccountsApi.endpoints.getChartOfAccounts.matchFulfilled,
      (state, { payload }) => {
      
        state.accounts = payload
      }
    )
  }
})

export const { setChartOfAccounts } = chartOfAccountSlice.actions
