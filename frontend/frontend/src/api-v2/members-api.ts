/* eslint-disable arrow-body-style */
import { api } from './index'

interface IGetMemberParams {
  orgId: string
  memberId?: string
  params?: {
    state?: 'active' | 'deactivated'
    search?: string
    page?: number
    size?: number
  }
}

interface IUpateMemberRoleParams {
  orgId: string
  memberId: string
  role: any
}

interface IUpdateMemberParams {
  orgId: string
  data: {
    firstName: string
    lastName: string
    addresses: any
    contacts: any
  }
}

const membersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthenticatedProfile: builder.query<any, IGetMemberParams>({
      query: ({ orgId }) => {
        return `${orgId}/members/me`
      },
      providesTags: ['members']
    }),
    getMembers: builder.query<any, IGetMemberParams>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/members`,
        method: 'GET',
        params: {
          ...params
        }
      }),
      providesTags: ['members']
    }),
    getMember: builder.query<any, IGetMemberParams>({
      query: ({ orgId, memberId }) => {
        return `${orgId}/members/${memberId}/profile`
      },
      providesTags: ['members']
    }),
    updateMember: builder.mutation<any, IUpdateMemberParams>({
      query: ({ orgId, data }) => ({
        url: `${orgId}/members/me`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['members', 'accounts']
    }),
    updateRole: builder.mutation<any, IUpateMemberRoleParams>({
      query: ({ orgId, memberId, role }) => ({
        url: `${orgId}/members/${memberId}/role`,
        method: 'PUT',
        body: {
          role
        }
      }),
      invalidatesTags: ['members']
    }),
    deactivateMember: builder.mutation<any, IGetMemberParams>({
      query: ({ orgId, memberId }) => ({
        url: `${orgId}/members/${memberId}/deactivate`,
        method: 'DELETE'
      }),
      invalidatesTags: ['members']
    }),
    activateMember: builder.mutation<any, IGetMemberParams>({
      query: ({ orgId, memberId }) => ({
        url: `${orgId}/members/${memberId}/activate`,
        method: 'POST'
      }),
      invalidatesTags: ['members']
    })
  })
})

export const {
  useGetMembersQuery,
  useGetMemberQuery,
  useUpdateRoleMutation,
  useDeactivateMemberMutation,
  useActivateMemberMutation,
  useGetAuthenticatedProfileQuery,
  useUpdateMemberMutation
} = membersApi
