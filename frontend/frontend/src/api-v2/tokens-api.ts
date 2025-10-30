/* eslint-disable arrow-body-style */
import { api } from './index'

const tokensApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTokens: builder.query<any, any>({
      query: () => ({
        url: '/tokens',
        method: 'GET'
      }),
      providesTags: ['tokens']
    })
  })
})

export const { useGetTokensQuery } = tokensApi
