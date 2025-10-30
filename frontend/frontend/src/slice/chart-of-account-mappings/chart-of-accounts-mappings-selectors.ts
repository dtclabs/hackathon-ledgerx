/* eslint-disable prefer-arrow-callback */
/* eslint-disable guard-for-in */
import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'

const selectSelf = (state: any) => state.chartOfAccountsMappings

export const selectMissingAccountMappings = createSelector(selectSelf, (state: AppState) => {
  const chartOfAccountsMappings = state.accountMappings
  return chartOfAccountsMappings?.filter((mapping) => mapping.chartOfAccount === null && mapping.type === 'wallet')
})

export const coaMappingsSelector = createSelector(selectSelf, (state: AppState) => state.accountMappings)
