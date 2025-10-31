/* eslint-disable prefer-destructuring */
/* eslint-disable arrow-body-style */
import { api } from './index'
import store from '@/state'
import { chunk } from 'lodash'
import Cookies from 'js-cookie'

interface IParamsSendAnalysis {
  eventType: string
  metadata: any
}

interface IParamsSendTxAnalysis {
  organizationId: string
  fromWalletId: string
  fromAddress: string
  valueAt: string
  hash: string
  cryptocurrencyId: string
  totalAmount: string
  totalRecipient: number
  blockchainId: string
  applicationName: 'multisend' | 'full_app'
  recipients: any
  correspondingChartOfAccounts: any
  notes: any
  attachments: any
}

interface IPostAnalysisForPayout {
  blockchainId: string
  type: string
  sourceType: string
  sourceAddress: string
  sourceWalletId: string
  hash: string
  applicationName: string
  totalLineItems: number
  lineItems: any // TODO-PENDING - Add type here for recipients array
  notes: string
  valueAt: string
  totalAmount: string
}

const deviceDetails = () => {
  const { userAgent } = navigator
  let browser = ''
  let os = ''

  const options = Intl.DateTimeFormat().resolvedOptions()

  if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Google Chrome'
  } else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Mozilla Firefox'
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Apple Safari'
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'Opera'
  } else if (userAgent.indexOf('Edge') > -1) {
    browser = 'Microsoft Edge'
  } else if (userAgent.indexOf('Trident') > -1) {
    browser = 'Internet Explorer'
  } else {
    browser = userAgent
  }

  if (/Windows/.test(userAgent)) {
    os = 'Windows'
  } else if (/Mac/.test(userAgent)) {
    os = 'Mac OS'
  } else if (/Linux/.test(userAgent)) {
    os = 'Linux'
  } else if (/Android/.test(userAgent)) {
    os = 'Android'
  } else if (/iOS/.test(userAgent)) {
    os = 'iOS'
  }

  return {
    os,
    browser,
    timezone: options.timeZone
  }
}

const analysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendAnalysis: builder.mutation<any, IParamsSendAnalysis>({
      queryFn: async ({ eventType, metadata }, _api, _extraOptions, baseQuery) => {
        const account = store.getState().accountV2?.account
        const traceId = store.getState().accountV2?.traceId
        const result = await baseQuery({
          url: '/analysis/interaction',
          method: 'POST',
          body: {
            eventType,
            accountId: account?.id ?? '',
            organizationId: account?.activeOrganizationId ?? '',
            traceId: traceId || '',
            browser: deviceDetails().browser,
            timezone: deviceDetails().timezone,
            location: deviceDetails().timezone,
            device: deviceDetails().os,
            url: window.location.href,
            referrerUrl: document.referrer,
            metadata: {
              ...(metadata && {
                ...metadata
              }),
              ...(Cookies.get('promo-cookie') && {
                promo: Cookies.get('promo-cookie') || ''
              })
            }
          }
        })
        return { data: null }
      }
    }),
    sendTransactionAnalysis: builder.mutation<any, IParamsSendTxAnalysis>({
      queryFn: async (data, _api, _extraOptions, baseQuery) => {
        const account = store.getState().accountV2?.account
        const traceId = store.getState().accountV2?.traceId
        const result = await baseQuery({
          url: '/analysis/create-transaction',
          method: 'POST',
          body: {
            traceId: traceId || '',
            organizationId: account?.activeOrganizationId ?? '',
            ...data
          }
        })
        return { data: null }
      }
    }),
    postAnalysisForPayout: builder.mutation<any, IPostAnalysisForPayout>({
      queryFn: async (data, _api, _extraOptions, baseQuery) => {
        const account = store.getState().accountV2?.account
        const traceId = store.getState().accountV2?.traceId
        const result = await baseQuery({
          url: '/analysis/create-payout',
          method: 'POST',
          body: {
            traceId: traceId || '',
            organizationId: account?.activeOrganizationId ?? '',
            ...data
          }
        })
        return { data: null }
      }
    }),
    batchSendAnalysis: builder.mutation<any, IParamsSendAnalysis[]>({
      queryFn: async (data, _api, _extraOptions, baseQuery) => {
        const account = store.getState().accountV2?.account
        const traceId = store.getState().accountV2?.traceId
        const browser = deviceDetails().browser
        const timezone = deviceDetails().timezone
        const location = deviceDetails().timezone
        const url = window.location.href
        const device = deviceDetails().os
        const referrerUrl = document.referrer
        // CHUNK IN BATCHES OF 2
        const batchCalls = chunk(data, 2)
        let hasError = false
        for (const batchCall of batchCalls) {
          const response = await Promise.all(
            batchCall.map((_data) => {
              const body = {
                ..._data,
                accountId: account?.id ?? '',
                organizationId: account?.activeOrganizationId ?? '',
                traceId: traceId || '',
                browser,
                timezone,
                location,
                device,
                url,
                referrerUrl
              }
              return baseQuery({
                url: '/analysis/interaction',
                method: 'POST',
                body
              })
            })
          )
          if (!hasError && response.some((res) => res.error)) {
            hasError = true
          }
        }
        return hasError ? { data: null, error: 'Some transactions did not send' } : { data: null }
      }
    })
  })
})

export const {
  useSendAnalysisMutation,
  useSendTransactionAnalysisMutation,
  usePostAnalysisForPayoutMutation,
  useBatchSendAnalysisMutation
} = analysisApi
