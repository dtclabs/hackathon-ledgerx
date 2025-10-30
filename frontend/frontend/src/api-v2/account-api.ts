/* eslint-disable arrow-body-style */
import { api } from './index'


const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateAuthenticatedAccount: builder.mutation<any, any>({
      query: (data) => ({
        url: '/accounts/me',
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['members', 'accounts'],
      transformResponse: (res) => res.data
    }),
    getUserAccount: builder.query<any, any>({
      query: () => ({
        url: '/accounts/me',
        method: 'GET'
      }),
      providesTags: ['accounts']
    }),
    getUserOrgAccount: builder.query<any, any>({
      query: () => ({
        url: '/organizations/me',
        method: 'GET'
      }),
      providesTags: ['accounts']
    })
  })
})

// @ts-ignore TS2339
export const useLazyGetUserAccountQuerySubscription = api.endpoints.getUserAccount.useLazyQuerySubscription

export const {
  useUpdateAuthenticatedAccountMutation,
  useGetUserAccountQuery,
  useLazyGetUserAccountQuery,
  useGetUserOrgAccountQuery,
  useLazyGetUserOrgAccountQuery
} = accountApi


