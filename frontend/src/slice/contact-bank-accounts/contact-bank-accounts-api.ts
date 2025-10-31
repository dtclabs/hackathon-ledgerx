/* eslint-disable arrow-body-style */
import { IPagination } from '@/api/interface'
import { api } from '../../api-v2/index'
import {
  IContactBankAccount,
  IGetContactBankAccount,
  IGetContactBankAccounts,
  IPostContactBankAccount,
  IUpdateContactBankAccount
} from './contact-bank-accounts-types'

const contactBankAccountsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecipientBankAccounts: builder.query<IPagination<IContactBankAccount>, IGetContactBankAccounts>({
      query: ({ orgId, contactId, params }) => ({
        url: `${orgId}/recipients/${contactId}/recipient-bank-accounts`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (response) => response.data,
      providesTags: ['bank-accounts']
    }),

    getRecipientBankAccount: builder.query<IContactBankAccount, IGetContactBankAccount>({
      query: ({ orgId, contactId, id }) => ({
        url: `${orgId}/recipients/${contactId}/recipient-bank-accounts/${id}`,
        method: 'GET'
      }),
      transformResponse: (response) => response.data,
      providesTags: ['bank-accounts']
    }),

    postRecipientBankAccount: builder.mutation<IContactBankAccount, IPostContactBankAccount>({
      query: ({ orgId, payload, contactId }) => ({
        url: `${orgId}/recipients/${contactId}/recipient-bank-accounts`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['bank-accounts']
    }),

    deleteRecipientBankAccount: builder.mutation<any, IGetContactBankAccount>({
      query: ({ orgId, contactId, id }) => ({
        url: `${orgId}/recipients/${contactId}/recipient-bank-accounts/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['bank-accounts']
    }),

    updateRecipientBankAccount: builder.mutation<IContactBankAccount, IUpdateContactBankAccount>({
      query: ({ orgId, payload, contactId, id }) => ({
        url: `${orgId}/recipients/${contactId}/recipient-bank-accounts/${id}`,
        method: 'PUT',
        body: payload
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['bank-accounts']
    })
  })
})

export const {
  useGetRecipientBankAccountQuery,
  useLazyGetRecipientBankAccountsQuery,
  useGetRecipientBankAccountsQuery,
  useLazyGetRecipientBankAccountQuery,
  useDeleteRecipientBankAccountMutation,
  usePostRecipientBankAccountMutation,
  useUpdateRecipientBankAccountMutation
} = contactBankAccountsApi
