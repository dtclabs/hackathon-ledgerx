/* eslint-disable arrow-body-style */
import { api } from './index'

export enum IntegrationName {
  XERO = 'xero',
  REQUEST_FINANCE = 'request_finance',
  QUICKBOOKS = 'quickbooks',
  DTC_PAY = 'dtcpay',
  TRIPLE_A = 'triple_a'
}

export const integrationNameMap = {
  [IntegrationName.XERO]: 'Xero',
  [IntegrationName.REQUEST_FINANCE]: 'Request Finance',
  [IntegrationName.QUICKBOOKS]: 'QuickBooks',
  [IntegrationName.DTC_PAY]: 'DTCpay',
  [IntegrationName.TRIPLE_A]: 'Triple A'
}

interface IintegrateAppParams {
  organizationId: string
  body: {
    integrationName: string
    code?: string
    redirectUri?: string
    metadata?: {
      signKey: string
      terminalId: string
      merchantId: string
    }
  }
}

interface IGetOrganizationIntegrationParams {
  organizationId: string
  integrationName: string
}

const organizationIntegrations = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrganizationIntegrations: builder.query<any, any>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/organization-integrations`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['organization-integrations', 'organization-integrations-list']
    }),
    getOrganizationIntegration: builder.query<any, IGetOrganizationIntegrationParams>({
      query: ({ organizationId, integrationName }) => ({
        url: `${organizationId}/organization-integrations/${integrationName}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['organization-integrations']
    }),
    integrateThirdPartyApp: builder.mutation<any, IintegrateAppParams>({
      query: ({ organizationId, body }) => ({
        url: `${organizationId}/organization-integrations`,
        body,
        method: 'POST'
      }),
      invalidatesTags: ['organization-integrations']
    })
  })
})

export const {
  useGetAllOrganizationIntegrationsQuery,
  useIntegrateThirdPartyAppMutation,
  useGetOrganizationIntegrationQuery
} = organizationIntegrations
