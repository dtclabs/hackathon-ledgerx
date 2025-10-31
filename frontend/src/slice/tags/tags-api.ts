/* eslint-disable arrow-body-style */

import { api } from '@/api-v2'
import { CreateTagPayload, IAnnotation, ITag, UpdateTagPayload } from './tag-type'
import { transactionsApi } from '@/api-v2/financial-tx-api'

const tagsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnnotations: builder.query<IAnnotation[], { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/tags`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['transactions']
    }),
    getTags: builder.query<ITag[], { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/tags`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['tags']
    }),
    createTag: builder.mutation<ITag, CreateTagPayload>({
      query: ({ organizationId, payload }) => ({
        url: `${organizationId}/tags`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['tags']
    }),
    updateTag: builder.mutation<ITag, UpdateTagPayload>({
      query: ({ organizationId, id, payload }) => ({
        url: `${organizationId}/tags/${id}`,
        method: 'PUT',
        body: payload
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['tags', 'transactions', 'draft-transactions'],
      async onQueryStarted({ organizationId, payload, id }, { dispatch, queryFulfilled }) {
        const tagPatchResult = dispatch(
          tagsApi.util.updateQueryData('getTags', { organizationId }, (draft) => {
            const tag = draft.find((_tag) => _tag.id === id)
            if (tag && payload.name) {
              tag.name = payload.name
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          tagPatchResult.undo()
        }
      }
    }),
    deleteTag: builder.mutation<any, { organizationId: string; id: string; page?: number; filterParams?: any }>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/tags/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['tags', 'transactions', 'draft-transactions'],
      async onQueryStarted({ organizationId, id, page, filterParams }, { dispatch, queryFulfilled }) {
        const transactionsPatchResult = dispatch(
          transactionsApi.util.updateQueryData(
            'getFinancialTransactions',
            { orgId: organizationId, page, params: filterParams ? { ...filterParams } : undefined },
            (draft) => {
              draft.items.forEach((transaction) => {
                if (id) {
                  const annotations = transaction?.annotations || []
                  transaction.annotations = annotations.filter((_tag) => _tag.id !== id)
                }
              })
            }
          )
        )
        const tagPatchResult = dispatch(
          tagsApi.util.updateQueryData('getTags', { organizationId }, (draft) => {
            const deletedArray = (draft || []).filter((_tag) => _tag.id !== id)
            draft = [...deletedArray]
          })
        )
        try {
          await queryFulfilled
        } catch {
          transactionsPatchResult.undo()
          tagPatchResult.undo()
        }
      }
    })
  })
})

export const {
  useGetTagsQuery,
  useCreateTagMutation,
  useDeleteTagMutation,
  useUpdateTagMutation,
  useGetAnnotationsQuery
} = tagsApi
