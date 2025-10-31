import { createSlice, createSelector } from '@reduxjs/toolkit'
import { api } from '@/api-v2'
import { AppState } from '@/state'

export interface IChainState {
  supportedChains: any
}

const initialState: IChainState = {
  supportedChains: []
}

export const chainsSlice = createSlice({
  name: 'chains-slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getChains.matchFulfilled,
      (state, { payload }) => {
        state.supportedChains = payload?.data || []
      }
    )
  }
})

const selectSelf = (state: AppState) => state

export const supportedChainsSelector = createSelector(selectSelf, (state) => {
  const verifiedCrypto = state.cryptocurrencies?.verifiedCryptoCurrencies || []
  const supportedChains = state?.supportedChains.supportedChains || []

  const detailedSupportedChains = []
  // missing BSC as verified tokens
  for (const chain of supportedChains) {
    for (const tokens of verifiedCrypto) {
      for (const token of tokens.addresses) {
        if (token.type === 'Coin' && chain.id === token.blockchainId) {
          detailedSupportedChains.push({
            ...chain,
            token,
            symbol: tokens.symbol
          })
        }
      }
    }
  }

  // Sample data for demo - wait for backend to be updated

  // const detailedSupportedChains = [
  //   {
  //     id: 'solana',
  //     name: 'Solana',
  //     imageUrl: '/svg/sample-token/Solana.svg',
  //     chainId: 'solana',
  //     isTestnet: false,
  //     blockExplorer: 'https://solscan.io',
  //     apiUrl: 'https://solana.com',
  //     rpcUrl: 'https://solana.com',
  //     safeUrl: '',
  //     symbol: 'SOL'
  //   },
  //   {
  //     id: 'bonk',
  //     name: 'Bonk',
  //     imageUrl: '/svg/sample-token/Bonk.svg',
  //     chainId: 'bonk',
  //     isTestnet: false,
  //     blockExplorer: 'https://bonk.solscan.io',
  //     apiUrl: 'https://bonk.com',
  //     rpcUrl: 'https://bonk.com',
  //     safeUrl: '',
  //     symbol: 'BONK'
  //   },
  //   {
  //     id: 'wif',
  //     name: 'WIF',
  //     imageUrl: '/svg/sample-token/Wif.svg',
  //     chainId: 'wif',
  //     isTestnet: false,
  //     blockExplorer: 'https://wif.com',
  //     apiUrl: 'https://wif.com',
  //     rpcUrl: 'https://wif.com',
  //     safeUrl: '',
  //     symbol: 'WIF'
  //   },
  //   {
  //     id: 'trump',
  //     name: 'Trump',
  //     imageUrl: '/svg/sample-token/Trump.svg',
  //     chainId: 'trump',
  //     isTestnet: false,
  //     blockExplorer: 'https://trump.com',
  //     apiUrl: 'https://trump.com',
  //     rpcUrl: 'https://trump.com',
  //     safeUrl: '',
  //     symbol: 'TRUMP'
  //   },
  //   {
  //     id: 'usdc',
  //     name: 'USDC',
  //     imageUrl: '/svg/sample-token/Usdc.svg',
  //     chainId: 'usdc',
  //     isTestnet: false,
  //     blockExplorer: 'https://usdc.com',
  //     apiUrl: 'https://usdc.com',
  //     rpcUrl: 'https://usdc.com',
  //     safeUrl: '',
  //     symbol: 'USDC'
  //   }
  // ]

  return detailedSupportedChains
})
