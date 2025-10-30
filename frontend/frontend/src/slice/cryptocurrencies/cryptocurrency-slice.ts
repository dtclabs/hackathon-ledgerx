import { createSlice } from '@reduxjs/toolkit'
import { cryptoCurrenciesApi } from '@/api-v2/cryptocurrencies'
import { pricesApi } from '@/api-v2/pricing-api'

const initialState: any = {
  allCryptoCurrencies: [],
  verifiedCryptoCurrencies: [],
  tokenPrices: {},
  tokenFiatPriceMap: {}
}

export const cryptocurrencySlice = createSlice({
  name: 'cryptocurrency-slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        // @ts-ignore
        cryptoCurrenciesApi.endpoints.getCryptoCurrencies.matchFulfilled,
        (state, { payload }) => {
          state.allCryptoCurrencies = payload?.data
        }
      )
      .addMatcher(
        // @ts-ignore
        cryptoCurrenciesApi.endpoints.getVerifiedCryptoCurrencies.matchFulfilled,
        (state, { payload }) => {
          state.verifiedCryptoCurrencies = payload?.data
        }
      )
      .addMatcher(
        // @ts-ignore
        pricesApi.endpoints.getTokenPrice.matchFulfilled,
        (state, { type, payload, meta }) => {
          const cryptocurrencyId = meta?.arg?.originalArgs?.params?.cryptocurrencyId ?? null
          const fiatCurrency = meta?.arg?.originalArgs?.params?.fiatCurrency ?? null
          if (cryptocurrencyId) {
            state.tokenPrices[cryptocurrencyId] = payload?.data
          }
          if (cryptocurrencyId) {
            if (!state.tokenFiatPriceMap[cryptocurrencyId]) {
              state.tokenFiatPriceMap[cryptocurrencyId] = { [fiatCurrency]: payload?.data }
            } else {
              state.tokenFiatPriceMap[cryptocurrencyId] = {
                ...state.tokenFiatPriceMap[cryptocurrencyId],
                [fiatCurrency]: payload?.data
              }
            }
          }
        }
      )
  }
})
