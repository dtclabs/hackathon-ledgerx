/* eslint-disable prefer-arrow-callback */
/* eslint-disable guard-for-in */
import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'
import { SubscriptionStatus } from '@/api-v2/subscription-api'

const selectSelf = (state: any) => state

export const selectOrganizationPlanActive = createSelector(selectSelf, (state: AppState) => {
  const subscription = state.subscription

  if (subscription?.subscriptionPlan?.status === SubscriptionStatus.EXPIRED) {
    return true
  }
  return false
})
