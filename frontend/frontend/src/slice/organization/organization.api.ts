import { api } from '../../api-v2/index'
import {
  IConnectOrganization,
  ICreateOrganizationParams,
  IUpdateOrgParams,
  IConnectOrgParams,
  ICreateOrganizationResponse,
  IOrganization
} from './organization.types'

interface IApiResult<T> {
  data: T
}

export const organizationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateOrganization: builder.mutation<any, IUpdateOrgParams>({
      query: ({ orgId, data }) => ({
        url: `organizations/${orgId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['accounts']
    }),
    createOrganization: builder.mutation<ICreateOrganizationResponse, ICreateOrganizationParams>({
      query: (body) => ({
        url: 'organizations',
        method: 'POST',
        body
      }),
      invalidatesTags: ['accounts']
    }),
    connectOrg: builder.query<IConnectOrganization, IConnectOrgParams>({
      query: ({ organisationId }) => ({
        url: `organizations/connect/${organisationId}`,
        method: 'GET'
      })
    }),
    getUsersOrganizations: builder.query<IApiResult<IOrganization[]>, any>({
      query: () => ({
        url: 'organizations/me',
        method: 'GET'
      })
    })
  })
})

export const {
  useUpdateOrganizationMutation,
  useConnectOrgQuery,
  useLazyConnectOrgQuery,
  useGetUsersOrganizationsQuery,
  useCreateOrganizationMutation
} = organizationApi
