/* eslint-disable arrow-body-style */
import { api } from './index'

interface IOrgSettings {
  payload: {
      countryId: string
      fiatCurrency: string
      timezoneId: string
  }
  orgId: string
}

const orgSettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<any, any>({
      query: () => ({
        url: '/countries',
        method: 'GET'
      }),
      providesTags: ['orgsettings']
    }),
    getFiatCurrencies: builder.query<any, any>({
        query: () => ({
            url: '/fiat-currencies',
            method: 'GET'
        }),
        providesTags: ['orgsettings']
    }),
    getTimezones: builder.query<any, any>({
        query: () => ({
            url: '/timezones',
            method: 'GET'
        }),
        providesTags: ['orgsettings']
    }),
    getOrgSettings: builder.query<any, any>({
        query: ({ orgId }) => ({
            url: `${orgId}/setting`,
            method: 'GET'
        }),
        providesTags: ['orgsettings'],
        transformResponse: (res) => res.data
    }),
    orgSettings: builder.mutation<any, IOrgSettings>({
        query: ({ orgId, payload }) => ({
          url: `${orgId}/setting`,
          method: 'PUT',
          body: payload
        }),
        transformResponse: (res) => res.data,
        invalidatesTags: ['wallets', 'transactions', 'orgsettings']
      }),
  })
})

export const { useGetCountriesQuery, useGetFiatCurrenciesQuery, useGetTimezonesQuery, useOrgSettingsMutation, useGetOrgSettingsQuery } = orgSettingsApi
