import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { assetsApi } from '@/api-v2/assets-api'
import { ISettingOptions } from '@/views/Assets'

export interface IAssetState {
  assets: any
  settings: ISettingOptions
}

const initialState: IAssetState = {
  assets: [],
  settings: {
    view: 'group',
    collapse: false,
    expand: false
  }
}

export const assetSlice = createSlice({
  name: 'asset-slice',
  initialState,
  reducers: {
    setAssets: (state, action: PayloadAction<boolean>) => {
      state.assets = action.payload
    },
    setAssetSettings: (state, action: PayloadAction<ISettingOptions>) => {
      state.settings = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      assetsApi.endpoints.getAssets.matchFulfilled,
      (state, { payload }) => {
        state.assets = payload
      }
    )
  }
})

export const { setAssets ,setAssetSettings} = assetSlice.actions
