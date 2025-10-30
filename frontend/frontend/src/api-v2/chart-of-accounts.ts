/* eslint-disable arrow-body-style */
import { chunk } from 'lodash'
import { api } from './index'
import { IntegrationName } from './organization-integrations'

interface IGetChartOfAccount {
  organizationId: string
  chartOfAccountId: string
}

export interface IChartOfAccountDetail {
  id: string
  name: string
  description: string
  code: string
  createdAt: string
  publicId: string
  remoteId: string
  source: string
  status: string
  type: string
  updatedAt: string
}

export interface IChartOfAccountSelection {
  id: string
  name: string
  code: string
  type: string // todo - enum
  isSelectable: boolean
}

interface IChartOfAccountsCount {
  COA: {
    public_id: string
    name: string
    code: string
    type: string
    description: string
  }
  count: string
}

interface ICreateChartOfAccount {
  organizationId: string
  body: {
    code: number
    name: string
    description: string
    type: string
  }
}

interface IUpdateChartOfAccount {
  organizationId: string
  id: string
  body: {
    code: number
    name: string
    description: string
    type: string
  }
}

interface IChartOfAccountMappingParams {
  organizationId: string
  params: {
    status: string[]
  }
}

type ImportCoa = { mergeAccountid: string }

interface IChartOfAccountImport {
  organizationId: string
  integrationName: IntegrationName
  body: {
    COAData: ImportCoa[]
  }
}

interface IBulkImport {
  organizationId: string
  data: { code: number; name: string; description: string; type: string }[]
}

export const chartOfAccountsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChartOfAccount: builder.query<IChartOfAccountDetail, IGetChartOfAccount>({
      query: ({ organizationId, chartOfAccountId }) => ({
        url: `${organizationId}/chart-of-accounts/${chartOfAccountId}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['chart-of-accounts']
    }),
    getChartOfAccounts: builder.query<IChartOfAccountDetail[], { organizationId: string; params?: any }>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/chart-of-accounts`,
        method: 'GET',
        params
      }),
      transformResponse: (res) => res.data,
      providesTags: ['chart-of-accounts']
    }),
    createAccount: builder.mutation<any, ICreateChartOfAccount>({
      query: ({ organizationId, body }) => ({
        url: `${organizationId}/chart-of-accounts`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts']
    }),
    updateAccount: builder.mutation<any, IUpdateChartOfAccount>({
      query: ({ organizationId, body, id }) => ({
        url: `${organizationId}/chart-of-accounts/${id}`,
        method: 'PUT',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts', 'transactions']
    }),
    deleteAccount: builder.mutation<any, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/chart-of-accounts/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts', 'transactions']
    }),
    importCoaAccount: builder.mutation<any, IChartOfAccountImport>({
      query: ({ organizationId, integrationName, body }) => ({
        url: `${organizationId}/chart-of-accounts/pass-through/${integrationName}/import-new/save`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: [
        'chart-of-accounts',
        'organization-integrations',
        'integration-whitelist-requests',
        'transactions'
      ]
    }),
    count: builder.query<IChartOfAccountsCount[], { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/chart-of-accounts/count`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['chart-of-accounts-count']
    }),
    importCSV: builder.mutation<any, IBulkImport>({
      queryFn: async ({ organizationId, data }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(data, 2)
        let hasError = false
        for (const batchCall of batchCalls) {
          const response = await Promise.all(
            batchCall.map((body) =>
              baseQuery({
                url: `${organizationId}/chart-of-accounts`,
                method: 'POST',
                body
              })
            )
          )
          if (!hasError && response.some((res) => res.error)) {
            hasError = true
          }
        }
        return hasError ? { data: null, error: 'Import chart of accounts failed' } : { data: null }
      },
      invalidatesTags: ['chart-of-accounts']
    })
  })
})

export const {
  useGetChartOfAccountQuery,
  useCreateAccountMutation,
  useGetChartOfAccountsQuery,
  useDeleteAccountMutation,
  useUpdateAccountMutation,
  useImportCoaAccountMutation,
  useImportCSVMutation,
  useCountQuery
} = chartOfAccountsApi
