import { api } from './index'

const providersWalletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProvidersWallet: builder.mutation<any, any>({
      query: (body) => ({
        url: '/providers/wallet',
        method: 'POST',
        body
      })
    })
  })
})

export const { useCreateProvidersWalletMutation } = providersWalletApi
