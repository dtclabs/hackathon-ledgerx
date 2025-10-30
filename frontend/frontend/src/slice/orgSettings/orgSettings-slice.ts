import { createSlice, createSelector } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '@/state'
import { api } from '@/api-v2'

export interface IOrgSettings {
  timezone: {
    id: string
    name: string
    abbrev: string
    utcOffset: number
  } | null
  country: {
    id: string
    name: string
    iso: string
    iso3: string
  } | null
  fiatCurrency: {
    name: string
    code: string
    symbol: string
    decimal: number
  } | null
}

export interface IOrgSettingsState {
  orgSettings: IOrgSettings | null
  fiatCurrencies: { name: string; code: string; symbol: string; decimal: number }[]
}

const initialState: IOrgSettingsState = {
  orgSettings: null,
  fiatCurrencies: []
}

export const orgSettingsSlice = createSlice({
  name: 'orgSettings-slice',
  initialState,
  reducers: {
    setOrgSettings: (state, action: PayloadAction<IOrgSettings>) => {
      state.orgSettings = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getOrgSettings.matchFulfilled,
      (state, { payload }) => {
        state.orgSettings = payload
      }
    )
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getFiatCurrencies.matchFulfilled,
      (state, { payload }) => {
        state.fiatCurrencies = payload?.data || []
      }
    )
  }
})

export const { setOrgSettings } = orgSettingsSlice.actions

const selectSelf = (state: AppState) => state.orgSettings

export const orgSettingsSelector = createSelector(selectSelf, (state) => {
  if (state.orgSettings) {
    return state.orgSettings
  }
  return {}
})
export const fiatCurrenciesSelector = createSelector(selectSelf, (state) => state.fiatCurrencies)
export const fiatCurrenciesMapSelector = createSelector(selectSelf, (state) =>
  state.fiatCurrencies?.reduce((cur, acc) => {
    cur[acc.code.toLowerCase()] = acc
    return cur
  }, {})
)
