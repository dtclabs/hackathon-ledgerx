/* eslint-disable arrow-body-style */
import { api } from '../../api-v2/index'
import { IDeleteContact, IPostContact } from './contacts.types'

const contactsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query<any, any>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/recipients`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (response) => response.data,
      providesTags: ['contacts']
    }),

    getAllContacts: builder.query<any, any>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/contacts`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (response) => response.data,
      providesTags: ['contacts']
    }),

    getContactById: builder.query<any, any>({
      query: ({ orgId, id }) => ({
        url: `${orgId}/recipients/${id}`,
        method: 'GET'
      }),
      transformResponse: (response) => response.data,
      providesTags: ['contacts']
    }),

    postContact: builder.mutation<any, IPostContact>({
      query: ({ orgId, payload, params }) => ({
        url: `${orgId}/recipients`,
        method: 'POST',
        body: payload,
        params: { ...params }
      }),
      invalidatesTags: ['contacts', 'transactions', 'pending-transactions', 'draft-transactions']
    }),

    deleteContact: builder.mutation<any, IDeleteContact>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/recipients/${payload.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['contacts', 'transactions', 'pending-transactions', 'draft-transactions']
    }),

    editContact: builder.mutation<any, IPostContact>({
      query: ({ orgId, payload, id }) => ({
        url: `${orgId}/recipients/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['contacts', 'transactions', 'pending-transactions', 'draft-transactions']
    }),

    getContactProvider: builder.query<any, any>({
      query: ({ orgId }) => ({
        url: `${orgId}/recipients/contact-provider`,
        method: 'GET'
      }),
      transformResponse: (response) => response.data
    }),

    getBanks: builder.query<any, { orgId: string; params?: any }>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/triple-a/banks`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (response) => response.data
    }),
    getTripleARequiredFields: builder.query<any, { orgId: string; countryCode: string }>({
      query: ({ orgId, countryCode }) => ({
        url: `${orgId}/triple-a/required-fields`,
        method: 'GET',
        params: {
          countryCode
        }
      }),
      transformResponse: (response) => response.data
    })
  })
})

export const {
  useGetContactByIdQuery,
  useGetContactProviderQuery,
  useGetAllContactsQuery,
  useDeleteContactMutation,
  useEditContactMutation,
  useGetContactsQuery,
  useLazyGetContactsQuery,
  usePostContactMutation,
  useGetBanksQuery,
  useLazyGetBanksQuery,
  useLazyGetTripleARequiredFieldsQuery
} = contactsApi
