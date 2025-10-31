/* eslint-disable arrow-body-style */
import { api } from './index'

interface IParamsGetOrganizationTrial {
  organizationId: string
}

const organizationTrials = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationTrial: builder.query<any, IParamsGetOrganizationTrial>({
      query: ({ organizationId }) => ({
        url: `/${organizationId}/organization-trials`,
        method: 'GET'
      }),
      providesTags: ['organization-trials']
    })
  })
})

export const { useGetOrganizationTrialQuery } = organizationTrials
