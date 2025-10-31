/* eslint-disable arrow-body-style */
import { api } from './index'

export interface IChainItem {
  id: string
  name: string
  chainId: string
  isTestnet: boolean
  blockExplorer: string
  apiUrl: string
  imageUrl: string
  rpcUrl?: string
  safeUrl?: string
  symbol?: string
}

interface IGetChainResponse {
  data: IChainItem[]
}

const chainsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChains: builder.query<IGetChainResponse, any>({
      query: () => ({
        url: '/blockchains',
        method: 'GET'
      }),
      providesTags: ['chains']
    })
  })
})

export const { useGetChainsQuery } = chainsApi
