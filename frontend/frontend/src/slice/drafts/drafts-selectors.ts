import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'

const selectSelf = (state: AppState) => state.drafts

export const makePaymentDraftsSelector = createSelector(selectSelf, (state) => state.makePaymentDrafts)
