import { api } from './index'

interface IBalanceGroupByChainParams {
  orgId: string
  params: {
    groupBy: 'blockchainId'
  }
}

interface IBalanceForWalletsGroupedByChain {
  orgId: string
  params: {
      groupBy: 'walletId'
      secondGroupBy: 'blockchainId'
      walletIds?: string[]
      blockchainIds?: string[] // turn it into a different endpoint in itself ?
  }
}

interface IBalanceForWalletById {
  orgId: string
  params: {
      groupBy: 'blockchainId'
      walletIds: string[]
      blockchainIds?: string[] 
  }
}

export const balancesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBalancePerChainForOrg: builder.query<any, IBalanceGroupByChainParams>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/balances`,
        method: 'GET',
        params
      }),
      transformResponse: (response) => response.data,
      providesTags: ['balancePerChainForOrg']
    }),
    getBalanceForWalletsGroupedByChain: builder.query<any, IBalanceForWalletsGroupedByChain>({
      query: ({ orgId, params }) => ({
          url: `${orgId}/balances`,
          method: 'GET',
          params
        }),
        transformResponse: (response) => response.data,
        providesTags: ['balanceForWalletsGroupedByChain']
    }),
    getBalanceForWalletById: builder.query<any, IBalanceForWalletById>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/balances`,
        method: 'GET',
        params
      }),
      transformResponse: (response) => response.data,
      providesTags: ['balanceForWalletById']
    })
  })
})

export const { useGetBalancePerChainForOrgQuery, useGetBalanceForWalletsGroupedByChainQuery, useGetBalanceForWalletByIdQuery } = balancesApi
