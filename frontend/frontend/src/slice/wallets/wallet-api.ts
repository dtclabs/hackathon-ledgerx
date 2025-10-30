/* eslint-disable arrow-body-style */
import { api } from '../../api-v2/index'
import { IDeleteWallet, IPostWallet, IUpdateWallet, IWalletItem } from '@/slice/wallets/wallet-types'

const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWallets: builder.query<any, any>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/wallets`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (response) => response.data,
      providesTags: ['wallets']
    }),

    getWalletById: builder.query<any, any>({
      query: ({ orgId, params, walletId }) => ({
        url: `${orgId}/wallets/${walletId}`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (response) => response.data,
      providesTags: ['wallets']
    }),

    postWallet: builder.mutation<any, IPostWallet>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/wallets`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['wallets', 'assets', 'transactions', 'cryptocurrencies', 'pending-transactions']
    }),

    updateWallet: builder.mutation<any, IUpdateWallet>({
      query: ({ orgId, payload, id }) => ({
        url: `${orgId}/wallets/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['wallets', 'assets', 'transactions', 'pending-transactions']
    }),

    updateWalletWithoutInvalidation: builder.mutation<any, IUpdateWallet>({
      query: ({ orgId, payload, id }) => ({
        url: `${orgId}/wallets/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['wallets', 'assets', 'transactions', 'pending-transactions']
    }),

    deleteWallet: builder.mutation<any, IDeleteWallet>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/wallets/${payload.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['wallets', 'assets', 'transactions', 'pending-transactions']
    }),

    syncBalance: builder.mutation<any, any>({
      query: ({ organisationId }) => ({
        url: `${organisationId}/wallets/sync`,
        method: 'POST'
      }),
      invalidatesTags: ['wallets', 'assets']
    }),
    syncPendingTransactions: builder.mutation<any, any>({
      query: ({ organisationId }) => ({
        url: `${organisationId}/wallets/sync-pending`,
        method: 'POST'
      }),
      invalidatesTags: ['wallets', 'transactions', 'assets', 'pending-transactions']
    })
  })
})

export const {
  useGetWalletsQuery,
  useGetWalletByIdQuery,
  useDeleteWalletMutation,
  usePostWalletMutation,
  useUpdateWalletMutation,
  useSyncBalanceMutation,
  useSyncPendingTransactionsMutation,
  useLazyGetWalletsQuery,
  useUpdateWalletWithoutInvalidationMutation
} = walletApi
