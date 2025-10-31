import { createReducer, createSelector } from '@reduxjs/toolkit'
import { setCurrentPage, setGlobalError } from './actions'
import { AppState } from '..'

export interface GlobalState {
  currentPage: string
  error: string | null
}

export const initialState: GlobalState = {
  currentPage: '',
  error: null
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setCurrentPage, (state, action) => {
      state.currentPage = action.payload
    })

    .addCase(setGlobalError, (state, action) => {
      if (!state.error) state.error = action.payload
      if (action.payload === null) state.error = null
    })
)

const selectSelf = (state: AppState) => state.global

const currentPageSelector = createSelector(selectSelf, (state) => state.currentPage)
const previousPageSelector = createSelector(selectSelf, (state) => state.previousPage)

export const errorSelector = createSelector(selectSelf, (state) => state.error)

export const globalSelectors = {
  currentPageSelector,
  errorSelector,
  previousPageSelector
}
