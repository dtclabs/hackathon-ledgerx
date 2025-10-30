/* eslint-disable prefer-arrow-callback */
/* eslint-disable guard-for-in */
import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'
import { IChainCryptocurrency, IRootCryptocurrencyState, ICryptocurrency } from './cryptocurrency.types'

const selectSelf = (state: any) => state

const selectCryptocurrencySlice = (state: any): IRootCryptocurrencyState => state.cryptocurrencies

interface ICryptocurrencyMap {
  [key: string]: ICryptocurrency
}

export const selectAllCryptoCurrencies = createSelector(selectSelf, (state: AppState) => {
  const { allCryptoCurrencies } = state.cryptocurrencies
  return allCryptoCurrencies
})

export const selectVerifiedCryptocurrencies = createSelector(selectSelf, (state: AppState) => {
  const { verifiedCryptoCurrencies } = state.cryptocurrencies

  return verifiedCryptoCurrencies
})

export const selectCryptocurrencyBySymbol = (_state) =>
  createSelector(
    (state) => state,
    (tokenSymbols: any) => {
      const tokens = []
      const cryptocurrencies = _state?.cryptocurrencies?.allCryptoCurrencies || []
      for (const symbol of tokenSymbols) {
        const token = cryptocurrencies.find((_token) => _token.symbol.toLowerCase() === symbol.toLowerCase())
        if (token) {
          tokens.push(token)
        }
      }
      return tokens
    }
  )

export const selectCryptocurrencyMap = createSelector(selectSelf, (state: AppState) => {
  const { allCryptoCurrencies } = state.cryptocurrencies

  const cryptocurrencyMap = {}
  allCryptoCurrencies.forEach((item) => {
    cryptocurrencyMap[item.symbol.toLowerCase()] = item
  })
  return cryptocurrencyMap
})

export const selectVerifiedCryptocurrencyMap = createSelector(selectSelf, (state: AppState) => {
  const { verifiedCryptoCurrencies } = state.cryptocurrencies

  const verifiedCryptocurrencyMap = {}
  verifiedCryptoCurrencies.forEach((item) => {
    verifiedCryptocurrencyMap[item.symbol.toLowerCase()] = item
  })
  return verifiedCryptocurrencyMap
})

export const selectedChainNativeToken = createSelector(selectSelf, (state: AppState): IChainCryptocurrency => {
  const { verifiedCryptoCurrencies } = state.cryptocurrencies

  let selectedChain = state.platform?.supportedChains?.find((chain) => chain.id === 'ethereum')
  if (state.platform.selectedChainId) {
    selectedChain = state.platform?.supportedChains?.find(
      (chain) => String(chain.chainId) === String(state.platform.selectedChainId)
    )
  }

  let nativeToken = null

  for (const currency of verifiedCryptoCurrencies) {
    const matchingAddress = currency.addresses.find(
      (address) => address.blockchainId === selectedChain?.id && address.type === 'Coin'
    )

    if (matchingAddress) {
      nativeToken = {
        ...matchingAddress,
        image: currency.image?.thumb,
        isVerified: currency.isVerified,
        name: currency.name,
        symbol: currency.symbol,
        publicId: currency.publicId
      }

      break
    }
  }

  return nativeToken
})

export const selectChainsNativeToken = createSelector(selectSelf, (state: AppState): any => {
  const { verifiedCryptoCurrencies } = state.cryptocurrencies
  const supportedChains = state.platform?.supportedChains

  const chainNativeTokens = {}

  for (const chain of supportedChains) {
    for (const currency of verifiedCryptoCurrencies) {
      const matchingAddress = currency.addresses.find(
        (address) => address.blockchainId === chain?.id && address.type === 'Coin'
      )

      if (matchingAddress) {
        chainNativeTokens[chain.id] = {
          ...matchingAddress,
          image: currency.image?.thumb,
          isVerified: currency.isVerified,
          name: currency.name,
          symbol: currency.symbol,
          publicId: currency.publicId
        }

        break
      }
    }
  }

  return chainNativeTokens
})

export const selectVerifiedCryptocurrencyIdMap = createSelector(selectCryptocurrencySlice, (state) => {
  const { verifiedCryptoCurrencies } = state

  const verifiedCryptocurrencyMap = verifiedCryptoCurrencies.reduce((acc, cryptoCurrency) => {
    if (cryptoCurrency?.isVerified) {
      acc[cryptoCurrency.publicId.toLowerCase()] = cryptoCurrency
    }
    return acc
  }, {} as ICryptocurrencyMap)
  return verifiedCryptocurrencyMap
})

export const selectTokenPriceIdMap = createSelector(selectCryptocurrencySlice, (state) => {
  const { tokenPrices } = state

  return tokenPrices
})
export const selectTokenFiatPriceMap = createSelector(selectCryptocurrencySlice, (state) => {
  const { tokenFiatPriceMap } = state

  return tokenFiatPriceMap
})

export const selectVerifiedCryptocurrencyAddressMap = createSelector(selectSelf, (state: AppState) => {
  const { verifiedCryptoCurrencies } = state.cryptocurrencies

  let selectedChain = state.platform?.supportedChains?.find((chain) => chain.id === 'ethereum')
  if (state.platform.selectedChainId) {
    selectedChain = state.platform?.supportedChains?.find(
      (chain) => String(chain.chainId) === String(state.platform.selectedChainId)
    )
  }
  const tokens = {}

  verifiedCryptoCurrencies.forEach((token) => {
    // Iterate through addresses of each token
    token.addresses.forEach((address) => {
      // Check if the blockchainId matches
      if (address.blockchainId === selectedChain?.id) {
        // If a match is found, construct the token object
        tokens[address.address] = {
          type: address.type,
          address: address.blockchainId,
          symbol: token.symbol,
          image: token.image.small // Assuming you want the small image
        }
      }
    })
  })

  return tokens
})

export const selectSelectedChainCryptocurrencyAddressMap = createSelector(selectSelf, (state: AppState) => {
  const { verifiedCryptoCurrencies } = state.cryptocurrencies

  let selectedChain = state.platform?.supportedChains?.find((chain) => chain.id === 'ethereum')

  if (state.platform.selectedChainId) {
    selectedChain = state.platform?.supportedChains?.find(
      (chain) => String(chain.chainId) === String(state.platform.selectedChainId)
    )
  }

  const nativeMap = {}

  for (const currency of verifiedCryptoCurrencies) {
    const matchingAddress = currency.addresses.find((address) => address.blockchainId === selectedChain?.id)

    if (matchingAddress) {
      nativeMap[currency.publicId] = {
        ...matchingAddress,
        image: currency.image?.thumb,
        isVerified: currency.isVerified,
        name: currency.name,
        symbol: currency.symbol,
        publicId: currency.publicId
      }
    }
  }

  return nativeMap
})

export const selectTokenPriceMap = createSelector(selectCryptocurrencySlice, (state) => state.tokenPrices)
export const selectVerifiedCryptocurrencyMap2 = createSelector(selectSelf, (state: AppState) => {
  const { verifiedCryptoCurrencies } = state.cryptocurrencies

  const verifiedCryptocurrencyMap = {}
  verifiedCryptoCurrencies
    .filter((cryptoCurrency) => cryptoCurrency?.isVerified)
    .forEach((item) => {
      verifiedCryptocurrencyMap[item.symbol.toLowerCase()] = item
    })
  return verifiedCryptocurrencyMap
})
