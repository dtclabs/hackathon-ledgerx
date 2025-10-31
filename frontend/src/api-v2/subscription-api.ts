/* eslint-disable arrow-body-style */
import { api } from './index'

export enum SubscriptionStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum PlanName {
  FREE_TRIAL = 'free_trial',
  STARTER = 'starter',
  BUSINESS = 'business'
}

export interface IPlan {
  planName: string
  startedAt: string
  expiredAt: string
  status: SubscriptionStatus
  organizationIntegrationAddOns: object
}

interface IRequestSubscription {
  requestType: 'interest' | 'upgrade' | 'downgrade' | 'cancellation'
  contactDetails: {
    email: string
  }
  requestDetails: {
    feedback?: string
    cancellationReasons?: string[]
    planName: 'starter' | 'business' | 'partner'
    billingCycle: 'annually' | 'semiannually'
  }
}

const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query<IPlan, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/subscriptions`,
        method: 'GET',
        params: { status: 'active' }
      }),
      transformResponse: (res) => res.data
    }),
    postSubscriptionRequest: builder.mutation<IRequestSubscription, any>({
      query: ({ organizationId , payload}) => ({
        url: `${organizationId}/subscription-related-requests`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (res) => res.data
    }),
  })
})

export const { useGetSubscriptionQuery, usePostSubscriptionRequestMutation, useLazyGetSubscriptionQuery } =
  subscriptionApi
