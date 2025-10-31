/* eslint-disable arrow-body-style */
import { api } from './index'

// {
          //   "blockchainId": "string",
          //   "type": "string",
          //   "sourceWalletId": "string",
          //   "hash": "string",
          //   "safeHash": "string",
          //   "notes": "string",
          //   "lineItems": [
          //     null
          //   ],
          //   "metadata": {}
          // }

interface ISubmitPaymentParams {
  params: {
    organizationId: string
  }
  body?: {
    blockchainId: string,
    type: string,
    sourceWalletId: string,
    hash?: string,
    safeHash?: string,
    notes: string,
    lineItems: any, // TODO-PENDING - Add type here for recipients array
    metadata?: any
  }
}

const payoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitPayment: builder.mutation<any, ISubmitPaymentParams>({
      query: ({ params, body }) => ({
        url: `${params?.organizationId}/payouts`,
        body,
        method: 'POST'
      }),
      invalidatesTags: ['transactions']
    })
  })
})

export const { useSubmitPaymentMutation } = payoutApi