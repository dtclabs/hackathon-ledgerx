import { createSlice, createSelector } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '@/state'
import { api } from '@/api-v2'

export interface IChain {
  id: string
  name: string
  chainId: string
  isTestnet: boolean
  blockExplorer: string
  imageUrl: string
  apiUrl: string
  rpcUrl?: string
  safeUrl?: string
}
export interface IPlatformState {
  selectedChainId: string
  supportedChains: IChain[] | []
  showBanner: boolean
}

const initialState: IPlatformState = {
  selectedChainId: '1',
  supportedChains: [],
  showBanner: false
}

export const platformSlice = createSlice({
  name: 'platform-slice',
  initialState,
  reducers: {
    setChain: (state, action: PayloadAction<string>) => {
      state.selectedChainId = action.payload
    },
    setShowBanner: (state, action: PayloadAction<boolean>) => {
      state.showBanner = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getChains.matchFulfilled,
      (state, { payload }) => {
        state.supportedChains = payload.data
      }
    )
  }
})

const selectSelf = (state: AppState) => state.platform

export const selectedChainSelector = createSelector(selectSelf, (state): IChain => {
  if (state.selectedChainId) {
    return state.supportedChains.find((chain) => chain.chainId === state.selectedChainId)
  }
  return state.supportedChains[0]
})

export const showBannerSelector = createSelector(selectSelf, (state) => state.showBanner)

export const { setChain, setShowBanner } = platformSlice.actions
