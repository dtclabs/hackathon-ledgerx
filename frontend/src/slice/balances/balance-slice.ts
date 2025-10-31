import { createSlice } from '@reduxjs/toolkit'
import { balancesApi } from '@/api-v2/balances-api'

interface IBalancePerChainForOrgState {
  balancePerChainForOrg: any
}

interface IBalanceForWalletsGroupedByChain {
  balanceForWalletsGroupedByChain: any
}

const initialState = {
  balancePerChainForOrg: {},
  balanceForWalletsGroupedByChain: {}
}

export const balancesSlice = createSlice({
  name: 'balances-slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      balancesApi.endpoints.getBalancePerChainForOrg.matchFulfilled,
      (state, { payload }) => {
        state.balancePerChainForOrg = payload
      }
    ).addMatcher(
      // @ts-ignore
      balancesApi.endpoints.getBalanceForWalletsGroupedByChain.matchFulfilled,
      (state, { payload }) => {
        state.balanceForWalletsGroupedByChain = payload
      }
    )
  }
})