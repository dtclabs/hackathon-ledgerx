/* eslint-disable arrow-body-style */
import { api } from './index'

interface ICoinCapHistoryParams {
  startMs: number
  endMs: number
}

interface ICoinGeckoRangeParams {
  fromSec: number
  toSec: number
}

export const marketPriceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSolHistoryCoincap: builder.query<any, ICoinCapHistoryParams>({
      query: ({ startMs, endMs }) => ({
        url: 'https://api.coincap.io/v2/assets/solana/history',
        method: 'GET',
        params: { interval: 'd1', start: startMs, end: endMs }
      }),
      providesTags: ['prices']
    }),
    getSolRangeCoingecko: builder.query<any, ICoinGeckoRangeParams>({
      query: ({ fromSec, toSec }) => ({
        url: 'https://api.coingecko.com/api/v3/coins/solana/market_chart/range',
        method: 'GET',
        params: { vs_currency: 'usd', from: fromSec, to: toSec }
      }),
      providesTags: ['prices']
    }),
    getLatestSolPrice: builder.query<any, void>({
      query: () => ({
        url: 'https://api.coingecko.com/api/v3/simple/price',
        method: 'GET',
        params: { ids: 'solana', vs_currencies: 'usd' }
      }),
      providesTags: ['prices']
    })
  })
})

export const { useLazyGetSolHistoryCoincapQuery, useLazyGetSolRangeCoingeckoQuery, useGetLatestSolPriceQuery } =
  marketPriceApi
