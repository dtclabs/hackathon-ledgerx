import { createReducer, createSelector } from '@reduxjs/toolkit'
import { AppState } from '..'
import {
  executed,
  importSource,
  pushTransaction,
  removeAllTransactions,
  removeCompletedTransactions,
  removeTransaction,
  resetSourceList,
  selectSource,
  setResetBalance,
  setResetMetamaskBalance,
  setTransactions,
  updateSourceByAddress
} from './actions'
import { FreeState } from './interface'

export const initialState: FreeState = {
  sourceList: [],
  recentlyTransactions: [],
  resetBalance: 0,
  resetMetamaskBalance: 0
}
export default createReducer(initialState, (builder) =>
  builder
    .addCase(pushTransaction, (state, action) => {
      state.recentlyTransactions.push(action.payload)
    })
    .addCase(executed, (state, action) => {
      const transaction = state.recentlyTransactions.find((item) => item.hash === action.payload)
      transaction.isExecuted = true
    })
    .addCase(removeTransaction, (state, action) => {
      state.recentlyTransactions = state.recentlyTransactions.filter((item) => item.hash !== action.payload)
    })
    .addCase(removeAllTransactions, (state) => {
      state.recentlyTransactions = []
    })
    .addCase(setTransactions, (state, action) => {
      state.recentlyTransactions = action.payload
    })
    .addCase(removeCompletedTransactions, (state) => {
      state.recentlyTransactions = state.recentlyTransactions.filter((item) => !item.isExecuted)
    })
    .addCase(setResetBalance, (state) => {
      state.resetBalance += 1
    })
    .addCase(setResetMetamaskBalance, (state) => {
      state.resetMetamaskBalance += 1
    })
    .addCase(importSource, (state, action) => {
      const isExist = state.sourceList.find((item) => item.address === action.payload.address)
      if (action.payload.new) {
        state.sourceList = [action.payload]
      } else if (!isExist) {
        state.sourceList.push(action.payload)
      } else {
        isExist.balance = action.payload.balance
      }
    })
    .addCase(selectSource, (state, action) => {
      state.selectedSource = action.payload
    })
    .addCase(resetSourceList, (state) => {
      state.sourceList = []
    })
    .addCase(updateSourceByAddress, (state, action) => {
      const source = state.sourceList.find((item) => item.address === action.payload.address)
      if (source && action.payload.balance) source.balance = action.payload.balance
    })
)

const selectSelf = (state: AppState) => state.free
export const recentlyTransactionsSelector = createSelector(selectSelf, (state) => state.recentlyTransactions)
export const resetBalanceSelector = createSelector(selectSelf, (state) => state.resetBalance)
export const resetMetamaskBalanceSelector = createSelector(selectSelf, (state) => state.resetMetamaskBalance)
export const sourceListSelector = createSelector(selectSelf, (state) => state.sourceList)

export const freeSelectors = { recentlyTransactionsSelector, resetBalanceSelector, sourceListSelector, resetMetamaskBalanceSelector }
