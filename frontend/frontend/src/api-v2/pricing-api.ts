/* eslint-disable arrow-body-style */
import { api } from './index'

interface IGetTokenPriceParams {
  params: {
    cryptocurrencyId: string
    fiatCurrency: string
    date: string
  }
}

export const pricesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTokenPrice: builder.query<any, IGetTokenPriceParams>({
      query: ({ params }) => ({
        url: '/prices',
        method: 'GET',
        params
      }),
      providesTags: ['prices']
    })
  })
})

export const { useGetTokenPriceQuery, useLazyGetTokenPriceQuery } = pricesApi
