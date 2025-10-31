import { api } from './index'

interface IAssetsParams {
  orgId: string
  params?: {
    nameOrSymbol?: string
    blockchainIds?: any
    walletIds?: string[]
    cryptocurrencyIds?: string[]
  }
}

// TODO: Deprecte this function as RTK Query automatically serializes params
const queryString = (params) => {
  let query = ''
  for (const item in params) {
    if (Array.isArray(params[item])) {
      for (let i = 0; i < params[item].length; i++) {
        query += `${item}=${params[item][i]}&`
      }
    } else if (params[item] || params[item] === 0) {
      query += `${item}=${params[item]}&`
    }
  }
  return query.slice(0, -1)
}

export const assetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<any, IAssetsParams>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/assets`,
        method: 'GET',
        params
      }),
      transformResponse: (response) => response.data,
      providesTags: ['assets']
    }),
    getTaxLots: builder.query<any, any>({
      query: ({ orgId, params, publicId }) => ({
        url: `${orgId}/assets/${publicId}/tax-lots`,
        method: 'GET',
        params
      }),
      transformResponse: (response) => response.data,
      providesTags: ['assets']
    }),
    getAssetCryptocurrencies: builder.query<any, any>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/assets/cryptocurrencies`,
        method: 'GET',
        params
      }),
      transformResponse: (response) => response.data,
      providesTags: ['assets']
    })
  })
})

export const { useGetAssetsQuery, useGetTaxLotsQuery, useGetAssetCryptocurrenciesQuery } = assetsApi
