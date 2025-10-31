/* eslint-disable arrow-body-style */
import { chunk } from 'lodash'
import { api } from './index'

interface IGetChartOfAccount {
  organizationId: string
  chartOfAccountId: string
}

export enum ChartOfAccountMappingType {
  FEE = 'fee',
  GAIN = 'gain',
  LOSS = 'loss',
  ROUNDING = 'rounding',
  WALLET = 'wallet',
  RECIPIENT = 'recipient'
}

export interface IChartOfAccountMapping {
  id: string
  type: ChartOfAccountMappingType
  organizationId: string
  chartOfAccount: any
  walletId: string
  cryptocurrencyId: string
}

interface ICreateChartOfAccountMapping {
  organizationId: string
  body: {
    chartOfAccountId: string
    cryptocurrencyId: string
    walletId: string
    type: ChartOfAccountMappingType
  }
}
interface IUpdateChartOfAccountMapping {
  organizationId: string
  id: string
  body: {
    chartOfAccountId: string
    toOverwrite?: boolean
    toOverwriteManualData?: boolean
  }
  params?: {
    chartOfAccountIds?: string[]
  }
  optimisticAccount?: { id: string; name: string; code: string }
}

interface IBulkCreateChartOfAccountMapping {
  organizationId: string
  data: {
    chartOfAccountId: string
    cryptocurrencyId: string
    walletId: string
    type: ChartOfAccountMappingType
  }[]
}
interface IBulkUpdateChartOfAccountMapping {
  organizationId: string
  chartOfAccountId: string
  optimisticAccount?: { id: string; name: string; code: string }
  ids: string[]
  params?: {
    chartOfAccountIds?: string[]
  }
}
interface IBulkEditChartOfAccountMapping {
  organizationId: string
  data: {
    body: any
    action: 'edit' | 'add' | 'remove'
  }[]
}

interface IGetChartOfAccountMapping {
  organizationId: string
  params?: {
    chartOfAccountIds?: string[]
  }
}

interface IGetChartOfAccountMappingCount {
  organizationId: string
  id: string
}

export const chartsOfAccountsMapping = api.injectEndpoints({
  endpoints: (builder) => ({
    getChartOfAccountsMapping: builder.query<IChartOfAccountMapping[], IGetChartOfAccountMapping>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/chart-of-account-mappings`,
        method: 'GET',
        params
      }),
      transformResponse: (res) => res.data,
      providesTags: ['chart-of-accounts-mapping']
    }),
    getChartOfAccountsMappingCount: builder.query<number, IGetChartOfAccountMappingCount>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/chart-of-account-mappings/${id}/count`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data
    }),
    createChartOfAccountMapping: builder.mutation<any, ICreateChartOfAccountMapping>({
      query: ({ organizationId, body }) => ({
        url: `${organizationId}/chart-of-account-mappings`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts-mapping']
    }),
    updateChartOfAccountMapping: builder.mutation<any, IUpdateChartOfAccountMapping>({
      query: ({ organizationId, id, body }) => ({
        url: `${organizationId}/chart-of-account-mappings/${id}`,
        method: 'PUT',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts-mapping', 'transactions', 'chart-of-accounts'],
      async onQueryStarted({ organizationId, id, params, optimisticAccount }, { dispatch, queryFulfilled }) {
        const accountsMappingsPatchResult = dispatch(
          chartsOfAccountsMapping.util.updateQueryData(
            'getChartOfAccountsMapping',
            { organizationId, params: params || undefined },
            (draft) => {
              const accountsMapping = draft.find((mapping) => mapping.id === id)

              if (accountsMapping) {
                if (optimisticAccount.id !== undefined) {
                  accountsMapping.chartOfAccount = {
                    ...accountsMapping.chartOfAccount,
                    id: optimisticAccount.id,
                    name: optimisticAccount.name,
                    code: optimisticAccount.code
                  }
                } else {
                  accountsMapping.chartOfAccount = null
                }
              }
            }
          )
        )
        try {
          await queryFulfilled
        } catch {
          accountsMappingsPatchResult.undo()
        }
      }
    }),
    deleteChartOfAccountMapping: builder.mutation<any, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/chart-of-account-mappings/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts-mapping']
    }),
    fakeBulkUpdateChartOfAccountsMapping: builder.mutation<any, IBulkUpdateChartOfAccountMapping>({
      queryFn: async ({ organizationId, ids, chartOfAccountId }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(ids, 2)
        let hasError = false
        for (const batchCall of batchCalls) {
          const response = await Promise.all(
            batchCall.map((coaMappingId) =>
              baseQuery({
                url: `${organizationId}/chart-of-account-mappings/${coaMappingId}`,
                method: 'PUT',
                body: { chartOfAccountId }
              })
            )
          )
          if (!hasError && response.some((res) => res.error)) {
            hasError = true
          }
        }
        return hasError ? { data: null, error: 'Mapping update failed' } : { data: null }
      },
      invalidatesTags: ['chart-of-accounts-mapping'],
      async onQueryStarted({ organizationId, ids, params, optimisticAccount }, { dispatch, queryFulfilled }) {
        const accountsMappingsPatchResult = dispatch(
          chartsOfAccountsMapping.util.updateQueryData(
            'getChartOfAccountsMapping',
            { organizationId, params: params || undefined },
            (draft) => {
              const accountsMappings = draft.filter((mapping) => ids.includes(mapping.id))

              if (accountsMappings.length) {
                accountsMappings.forEach((mapping) => {
                  if (optimisticAccount.id !== undefined) {
                    mapping.chartOfAccount = {
                      ...mapping.chartOfAccount,
                      id: optimisticAccount.id,
                      name: optimisticAccount.name,
                      code: optimisticAccount.code
                    }
                  } else {
                    mapping.chartOfAccount = null
                  }
                })
              }
            }
          )
        )
        try {
          await queryFulfilled
        } catch {
          accountsMappingsPatchResult.undo()
        }
      }
    }),
    fakeBulkDeleteChartOfAccountsMapping: builder.mutation<any, any>({
      queryFn: async ({ organizationId, data }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(data, 2)
        let hasError = false
        for (const batchCall of batchCalls) {
          const response = await Promise.all(
            batchCall.map((id) =>
              baseQuery({
                url: `${organizationId}/chart-of-account-mappings/${id}`,
                method: 'DELETE'
              })
            )
          )
          if (!hasError && response.some((res) => res.error)) {
            hasError = true
          }
        }
        return hasError ? { data: null, error: 'Mapping remove failed' } : { data: null }
      },
      invalidatesTags: ['chart-of-accounts-mapping']
    }),
    fakeBulkCreateChartOfAccountsMapping: builder.mutation<any, IBulkCreateChartOfAccountMapping>({
      queryFn: async ({ organizationId, data }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(data, 2)
        let hasError = false
        for (const batchCall of batchCalls) {
          const response = await Promise.all(
            batchCall.map((body) =>
              baseQuery({
                url: `${organizationId}/chart-of-account-mappings`,
                method: 'POST',
                body
              })
            )
          )
          if (!hasError && response.some((res) => res.error)) {
            hasError = true
          }
        }
        return hasError ? { data: null, error: 'Mapping add failed' } : { data: null }
      },
      invalidatesTags: ['chart-of-accounts-mapping']
    }),
    fakeBulkEditChartOfAccountsMapping: builder.mutation<any, IBulkEditChartOfAccountMapping>({
      queryFn: async ({ organizationId, data }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(data, 2)
        let hasError = false
        for (const batchCall of batchCalls) {
          const response = await Promise.all(
            batchCall.map((item) => {
              if (item.action === 'add') {
                return baseQuery({
                  url: `${organizationId}/chart-of-account-mappings`,
                  method: 'POST',
                  body: item.body
                })
              }
              if (item.action === 'edit') {
                return baseQuery({
                  url: `${organizationId}/chart-of-account-mappings/${item.body.id}`,
                  method: 'PUT',
                  body: { chartOfAccountId: item.body.chartOfAccountId }
                })
              }
              return baseQuery({
                url: `${organizationId}/chart-of-account-mappings/${item.body.id}`,
                method: 'DELETE'
              })
            })
          )
          if (!hasError && response.some((res) => res.error)) {
            hasError = true
          }
        }
        return hasError ? { data: null, error: 'Mapping add failed' } : { data: null }
      },
      invalidatesTags: ['chart-of-accounts-mapping']
    })
  })
})

export const {
  useGetChartOfAccountsMappingQuery,
  useGetChartOfAccountsMappingCountQuery,
  useLazyGetChartOfAccountsMappingCountQuery,
  useUpdateChartOfAccountMappingMutation,
  useCreateChartOfAccountMappingMutation,
  useDeleteChartOfAccountMappingMutation,
  useFakeBulkCreateChartOfAccountsMappingMutation,
  useFakeBulkUpdateChartOfAccountsMappingMutation,
  useFakeBulkDeleteChartOfAccountsMappingMutation,
  useFakeBulkEditChartOfAccountsMappingMutation
} = chartsOfAccountsMapping
