import { createSlice, createSelector } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '@/state'
import { api } from '@/api-v2'
import { PlanName, SubscriptionStatus } from '@/api-v2/subscription-api'
import { isMonetisationEnabled } from '@/config-v2/constants'

interface ISubscriptionPlan {
  planName: string
  status: string
  billingCycle: string
  startedAt: string
  expiredAt: string
}

// TODO : Add show banner here
export interface ISubscriptionState {
  subscriptionPlan: ISubscriptionPlan
  showUpgradeModal: boolean
  showAddOnModal: boolean
}

const initialState: ISubscriptionState = {
  subscriptionPlan: {
    planName: '',
    status: '',
    billingCycle: '',
    startedAt: '',
    expiredAt: ''
  },
  showUpgradeModal: false,
  showAddOnModal: false
}

export const subscriptionSlice = createSlice({
  name: 'subscription-slice',
  initialState,
  reducers: {
    toggleUpgradeModal: (state, action: PayloadAction<boolean>) => {
      state.showUpgradeModal = action.payload
    },
    toggleAddOnModal: (state, action) => {
      state.showAddOnModal = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getSubscription.matchFulfilled,
      (state, { payload }) => {
        state.subscriptionPlan = payload
      }
    )
  }
})

const selectSelf = (state: AppState) => state.subscription

export const subscriptionPlanSelector = createSelector(selectSelf, (state) => state.subscriptionPlan)
/* eslint-disable no-else-return */
export const planPermisstionSelector = createSelector(selectSelf, (state) => {
  if (isMonetisationEnabled) {
    if (state.subscriptionPlan?.planName === PlanName.FREE_TRIAL && state.subscriptionPlan?.status === SubscriptionStatus.ACTIVE) {
      return false
    } else if (state.subscriptionPlan?.organizationIntegrationAddOns?.xero === true) {
      return false
    }  else if (state.subscriptionPlan?.organizationIntegrationAddOns?.quickbooks === true) {
      return false
    }
    
    return true
  }
  return false
})
export const showUpgradeModalSelector = createSelector(selectSelf, (state) => state.showUpgradeModal)
export const showAddOnModalSelector = createSelector(selectSelf, (state) => state.showAddOnModal)

export const { toggleUpgradeModal, toggleAddOnModal } = subscriptionSlice.actions
