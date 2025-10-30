/* eslint-disable arrow-body-style */
import { api } from '@/api-v2'
import { IGetPendingTransactionsParams, IGetPendingTransactionsResponse } from './pending-transactions.dto'

const pendingTransactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPendingTransactionsNew: builder.query<IGetPendingTransactionsResponse, IGetPendingTransactionsParams>({
      query: ({ organizationId, params }) => ({
        url: `/${organizationId}/pending-transactions`,
        method: 'GET',
        params
      }),
      providesTags: ['pending-transactions']
    })
  })
})

export const { useGetPendingTransactionsNewQuery, useLazyGetPendingTransactionsNewQuery } = pendingTransactionsApi
