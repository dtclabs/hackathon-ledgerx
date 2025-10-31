import queryString from 'query-string'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getAccessToken, removeAccessToken } from '../utils/localStorageService'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { log } from '@/utils-v2/logger'
import store from '@/state'
import Router from 'next/router'
import { toast } from 'react-toastify'

let isSessionExpired = false

// This is so we don't send error log to sentry as these are expected to error
const BLACKLIST_URLS = ['organizationIntegrations']
const BLACKLIST_CODES = [401, 404, 403]

export const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  paramsSerializer: (params: Record<string, any>) =>
    queryString.stringify(params, { arrayFormat: 'none', skipEmptyString: true, skipNull: true }),
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken()

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    } else {
      // Remove 'Content-Type' if overwriting, to RTK auto generate

      headers.delete('Content-Type')
    }
    // If we have a token set in state, let's assume that we should be passing it.

    return headers
  }
})

const customBaseQuery = async (args, api, extraOptions) => {
  let result
  try {
    result = await baseQuery(args, api, extraOptions)
    /* eslint-disable prefer-regex-literals */
    const regexForClientErrors = new RegExp(/[45][0-9]{2}/)
    const responseCode = result?.meta?.response?.status
    if (
      regexForClientErrors.test(responseCode) &&
      !BLACKLIST_URLS.includes(api?.endpoint) &&
      !BLACKLIST_CODES.includes(responseCode)
    ) {
      const tagObject = { name: 'apiEndpoint', value: `${args.method} ${args.url}` }

      log.error(
        `${responseCode} Error while fetching ${api?.endpoint}`,
        [`${responseCode} Error while fetching ${api?.endpoint}`],
        { actualErrorObject: JSON.stringify(result) },
        `${window.location.pathname}`,
        tagObject
      )
    }

    if (
      responseCode === 401 &&
      // @ts-ignore
      Router.router.state.pathname.includes('organization') &&
      window.location.pathname !== '/'
    ) {
      if (!isSessionExpired && window.location.pathname !== '/') {
        isSessionExpired = true
        toast.error('Session has expired.', { position: 'top-right' })
      }
      removeAccessToken()
      store.dispatch({ type: 'reset/INITIAL_STATE' })
      Router.push('/')
    }

    return result
  } catch (err) {
    sentryCaptureException(err)
    return err
  }
}

export const api = createApi({
  reducerPath: 'api',
  tagTypes: [
    'invitations',
    'members',
    'tokens',
    'chains', // TODO: To be deprecated
    'accounts',
    'paymentlinks',
    'cryptocurrencies',
    'auth',
    'transactions',
    'wallets',
    'assets',
    'files',
    'orgsettings',
    'categories',
    'contacts',
    'transaction-details',
    'wallet-groups',
    'supportedChains',
    'organization-integrations',
    'integration-whitelist-requests',
    'chart-of-accounts',
    'chart-of-accounts-mapping',
    'chart-of-accounts-count',
    'journal-entry-exports',
    'pending-transactions',
    'chart-of-accounts-mapping-selections',
    'chart-of-accounts-transaction-selections',
    'organization-trials',
    'balancePerChainForOrg',
    'balanceForWalletsGroupedByChain',
    'balanceForWalletById',
    'nfts',
    'invoices',
    'feature-flags',
    'csv-exports',
    'bank-feed-exports',
    'prices',
    'organization-integrations-list',
    'draft-transactions',
    'balance-reports',
    'tags',
    'bank-accounts',
    'nft-whitelist',
    'card-onboarding',
    'cards'
  ],
  baseQuery: customBaseQuery,
  endpoints: () => ({})
})
