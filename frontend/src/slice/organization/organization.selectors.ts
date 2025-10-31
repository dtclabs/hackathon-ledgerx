import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'
import { IOrganization } from './organization.types'

const selectSelf = (state: any) => state

export const selectUserOrganizations = createSelector(selectSelf, (state: AppState): IOrganization[] => {
  const { userOrganizations } = state.organization
  return userOrganizations
})

