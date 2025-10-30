/* eslint-disable arrow-body-style */
import { api } from './index'

interface IPostGroup {
  payload: {
    name: string
  }
  orgId: string
}

interface IDeleteGroup {
  payload: {
    id: string
  }
  orgId: string
}

interface IUpdateGroup {
  payload: {
    name: string
  }
  orgId: string
  id: string
}

const walletGroupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWalletGroups: builder.query<any, any>({
      query: ({ orgId }) => ({
        url: `${orgId}/wallet-groups`,
        method: 'GET'
      }),
      transformResponse: (response) => response.data,
      providesTags: ['wallet-groups', 'wallets']
    }),

    postWalletGroup: builder.mutation<any, IPostGroup>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/wallet-groups`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['wallet-groups']
    }),

    updateWalletGroup: builder.mutation<any, IUpdateGroup>({
      query: ({ orgId, payload, id }) => ({
        url: `${orgId}/wallet-groups/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['wallet-groups']
    }),

    deleteWalletGroup: builder.mutation<any, IDeleteGroup>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/wallet-groups/${payload.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['wallet-groups']
    })
  })
})

export const {
  useDeleteWalletGroupMutation,
  useGetWalletGroupsQuery,
  usePostWalletGroupMutation,
  useUpdateWalletGroupMutation
} = walletGroupApi
