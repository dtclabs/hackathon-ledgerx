/* eslint-disable arrow-body-style */
import { api } from './index'

interface IPaymentLink {
  payload: {
    cryptocurrency: string
    blockchainId: string
    address: string
  }
  orgId: string
}

interface IPaymentLinkMeta {
  orgId: string
  payload: {
    hash: string
    fromAddress: string
    toAddress: string
    invoice: string
    paymentLinkId: string
    completedAt: string
    remarks?: string
    contactDetails?: string
    cryptocurrencyAmount: string
    cryptocurrencySymbol: string
    fiatValue: string
  }
}

interface IPaymentLinkDelete {
  payload: {
    id: string
  }
  orgId: string
}

const paymentLinkApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentLinks: builder.query({
      query: (orgId) => ({
        url: `${orgId}/payment-links`,
        method: 'GET'
      }),
      providesTags: ['paymentlinks']
    }),

    postPaymentLink: builder.mutation<any, IPaymentLink>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/payment-links`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['paymentlinks']
    }),

    paymentLinkMeta: builder.mutation<any, IPaymentLinkMeta>({
      query: ({ payload }) => ({
        url: 'payment-link-metadata',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['paymentlinks']
    }),
    deletePaymentLink: builder.mutation<any, IPaymentLinkDelete>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/payment-links/${payload.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['paymentlinks']
    })
  })
})

export const {
  useGetPaymentLinksQuery,
  usePostPaymentLinkMutation,
  useDeletePaymentLinkMutation,
  usePaymentLinkMetaMutation
} = paymentLinkApi
