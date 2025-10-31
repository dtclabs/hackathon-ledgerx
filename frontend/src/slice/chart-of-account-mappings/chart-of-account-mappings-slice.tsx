import { AppState } from '@/state'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { chartsOfAccountsMapping } from '@/api-v2/chart-of-accounts-mapping'

export interface IChartOfAccountsMappingState {
  accountMappings: any
}

const initialState: IChartOfAccountsMappingState = {
  accountMappings: []
}

export const chartOfAccountsMappingSlice = createSlice({
  name: 'chart-of-accounts-mapping-slice',
  initialState,
  reducers: {
    setAccountMappings: (state, action: PayloadAction<any>) => {
      state.accountMappings = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      chartsOfAccountsMapping.endpoints.getChartOfAccountsMapping.matchFulfilled,
      (state, { payload }) => {
        state.accountMappings = payload
      }
    )
  }
})

export const { setAccountMappings } = chartOfAccountsMappingSlice.actions
