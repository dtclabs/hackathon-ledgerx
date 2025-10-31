/* eslint-disable arrow-body-style */
import { api } from './index'
import { IntegrationName } from './organization-integrations'

interface IGetOrganizationIntegrationsParams {
  organizationId: string
  integration?: string
  platform?: string
}

interface IGetXeroAccountsParams {
  organizationId: string
  integration: IntegrationName
}

interface IWhitelistRequestStatusParams {
  organizationId: string
  integration: IntegrationName
}

interface ISwapIntegrationTokenParams {
  organizationId: string
  integration: IntegrationName
  body: {
    token: string
  }
}

interface IWhitelistRequestParams {
  organizationId: string
  body: {
    integrationName: IntegrationName
    contactEmail: string
  }
}

interface IUpdateIntegrationParams {
  organizationId: string
  integrationName: IntegrationName
  body: {
    migrationData: any
    modifiedCoa: any
  }
}

interface IChartOfAccountImport {
  organizationId: string
  integrationName: IntegrationName
  body: {
    COAData: any
    migrationData: any
  }
}

interface ISaveModifiedAccounts {
  organizationId: string
  integration: IntegrationName
  body: {
    modifiedData: any
    restoredData: any
    archivedData: any
    deletedData: any
  }
}

interface IMigrationStatusParams {
  organizationId: string
  integration: IntegrationName
}

const mergeRootfiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    whitelistRequestStatus: builder.query<any, IWhitelistRequestStatusParams>({
      query: ({ organizationId, integration }) => ({
        url: `${organizationId}/integration-whitelist-requests/${integration}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['integration-whitelist-requests']
    }),
    retrieveRemoteChartOfAccounts: builder.query<any, IGetXeroAccountsParams>({
      query: ({ organizationId, integration }) => ({
        url: `${organizationId}/chart-of-accounts/pass-through/${integration}/import-new`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['integration-whitelist-requests']
    }),

    organizationIntegrations: builder.query<any, IGetOrganizationIntegrationsParams>({
      query: ({ organizationId, integration }) => ({
        url: `${organizationId}/organization-integrations/${integration}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['organization-integrations']
    }),
    modifiedIntegration: builder.query<any, IWhitelistRequestStatusParams>({
      query: ({ organizationId, integration }) => ({
        url: `${organizationId}/chart-of-accounts/pass-through/${integration}/sync`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['chart-of-accounts']
    }),
    updateIntegration: builder.mutation<any, IUpdateIntegrationParams>({
      query: ({ organizationId, body, integrationName }) => ({
        url: `${organizationId}/chart-of-accounts/pass-through/${integrationName}/sync/save`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['integration-whitelist-requests', 'transactions']
    }),
    whitelistRequest: builder.mutation<any, IWhitelistRequestParams>({
      query: ({ organizationId, body }) => ({
        url: `${organizationId}/integration-whitelist-requests`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['integration-whitelist-requests']
    }),

    integrationCodeRequest: builder.mutation<any, IWhitelistRequestStatusParams>({
      query: ({ organizationId, integration }) => ({
        url: `${organizationId}/organization-integrations`,
        method: 'POST',
        body: {
          integrationName: integration
        }
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['organization-integrations']
    }),

    swapIntegrationToken: builder.mutation<any, ISwapIntegrationTokenParams>({
      query: ({ organizationId, integration, body }) => ({
        url: `${organizationId}/organization-integrations/${integration}/swapToken`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['organization-integrations', 'integration-whitelist-requests']
    }),
    onboardingImportAccounts: builder.mutation<any, IChartOfAccountImport>({
      query: ({ organizationId, integrationName, body }) => ({
        url: `${organizationId}/organization-integrations/${integrationName}/submit`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts', 'organization-integrations', 'integration-whitelist-requests']
    }),
    importAccount: builder.mutation<any, IChartOfAccountImport>({
      query: ({ organizationId, integrationName, body }) => ({
        url: `${organizationId}/organization-integrations/${integrationName}/import/save`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts', 'integration-whitelist-requests', 'transactions']
    }),
    disconnectIntegration: builder.mutation<any, IGetOrganizationIntegrationsParams>({
      query: ({ organizationId, integration }) => ({
        url: `${organizationId}/organization-integrations/${integration}/disconnect`,
        method: 'POST'
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: [
        'organization-integrations',
        'organization-integrations-list',
        'integration-whitelist-requests',
        'chart-of-accounts',
        'transactions',
        'invoices'
      ]
    }),
    syncIntegrationSettings: builder.mutation<any, any>({
      query: ({ organizationId, integration }) => ({
        url: `${organizationId}/organization-integrations/${integration}/sync-settings`,
        method: 'POST'
      }),
      transformResponse: (res) => res.data
    }),
    updateModifiedAccounts: builder.mutation<any, ISaveModifiedAccounts>({
      query: ({ organizationId, integration, body }) => ({
        url: `${organizationId}/chart-of-accounts/pass-through/${integration}/sync/save`,
        method: 'POST',
        body
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['chart-of-accounts', 'transactions']
    })
  })
})

export const {
  useWhitelistRequestStatusQuery,
  useOrganizationIntegrationsQuery,
  useWhitelistRequestMutation,
  useIntegrationCodeRequestMutation,
  useSwapIntegrationTokenMutation,
  useRetrieveRemoteChartOfAccountsQuery,
  useOnboardingImportAccountsMutation,
  useImportAccountMutation,
  useLazyRetrieveRemoteChartOfAccountsQuery,
  useModifiedIntegrationQuery,
  useLazyModifiedIntegrationQuery,
  useUpdateIntegrationMutation,
  useDisconnectIntegrationMutation,
  useUpdateModifiedAccountsMutation,
  useSyncIntegrationSettingsMutation
} = mergeRootfiApi
