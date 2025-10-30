/* eslint-disable arrow-body-style */
import { api } from './index'

export const featureFlagApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureFlags: builder.query<any, { organizationId: string; name: string }>({
      query: ({ organizationId, name }) => ({
        url: `${organizationId}/feature-flags`,
        method: 'GET',
        params: {
          name
        }
      }),
      providesTags: ['feature-flags']
    })
  })
})

export const { useGetFeatureFlagsQuery } = featureFlagApi
