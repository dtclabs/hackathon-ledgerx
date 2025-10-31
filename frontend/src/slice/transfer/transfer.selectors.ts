import { createSelector } from '@reduxjs/toolkit'
import { AppState } from '@/state'
import { IReviewData } from './transfer.types'

const reviewDataSelector = (state: AppState) => state.transfer.reviewData
const isEoaTransferSelector = (state: AppState) => state.transfer.isEoaTransfer

// Memoized selector

export const selectReviewData = createSelector([reviewDataSelector], (reviewData): IReviewData => reviewData)
export const selectIsEoaTransfer = createSelector(
  [isEoaTransferSelector],
  (isEoaTransferState): boolean => isEoaTransferState
)