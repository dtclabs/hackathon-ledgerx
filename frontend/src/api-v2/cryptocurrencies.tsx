/* eslint-disable arrow-body-style */
import { chunk } from 'lodash'
import { api } from './index'

interface IGetCryptoCurrencyParams {
  organisationId: string
  params?: {
    walletIds?: string[]
    blockchainIds?: string[]
  }
}

interface IGetCrypto {
  walletIds?: string[]
  blockchainIds?: string[]
}

interface IFiatCurrencyParams {
  code: string
}

interface IGetWalletCrypto {
  organizationId: string
  blockchainIds?: string[]
  walletIds?: string[]
}

export const cryptoCurrenciesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCryptoCurrencies: builder.query<any, IGetCrypto>({
      query: (params) => ({
        url: '/cryptocurrencies',
        method: 'GET',
        params
      }),
      providesTags: ['cryptocurrencies']
    }),
    getVerifiedCryptoCurrencies: builder.query<any, IGetCrypto>({
      query: (params) => ({
        url: '/cryptocurrencies?isVerified=true',
        method: 'GET'
      }),
      providesTags: ['cryptocurrencies']
    }),
    getFiatCurrencyByCode: builder.query<any, IFiatCurrencyParams>({
      query: ({ code }) => ({
        url: `/fiat-currencies/${code}`,
        method: 'GET'
      })
      // providesTags: ['cryptocurrencies']
    }),
    getOrganisationCryptocurrencies: builder.query<any, IGetCryptoCurrencyParams>({
      query: ({ organisationId, params }) => ({
        url: `/${organisationId}/cryptocurrencies`,
        params,
        method: 'GET'
      }),
      providesTags: ['cryptocurrencies']
    }),
    getWalletCryptocurrencies: builder.query<any, IGetWalletCrypto>({
      queryFn: async ({ organizationId, blockchainIds, walletIds }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(walletIds, 2)
        const data = {}
        for (const batchCall of batchCalls) {
          await Promise.all(
            batchCall.map((walletId) =>
              baseQuery({
                url: `${organizationId}/cryptocurrencies`,
                method: 'GET',
                params: {
                  walletIds: [walletId],
                  blockchainIds
                }
              }).then((response) => {
                data[walletId] = response?.data?.data
              })
            )
          )
        }
        return { data }
      }
    })
  })
})

export const {
  useGetWalletCryptocurrenciesQuery,
  useGetCryptoCurrenciesQuery,
  useGetVerifiedCryptoCurrenciesQuery,
  useGetFiatCurrencyByCodeQuery,
  useGetOrganisationCryptocurrenciesQuery,
  useLazyGetOrganisationCryptocurrenciesQuery
} = cryptoCurrenciesApi
