/* eslint-disable arrow-body-style */
import { api } from './index'

interface IMemberInvite {
  payload: {
    firstName: string
    lastName: string
    email: string
    address: string
    role: 'Owner' | 'Employee' | 'Admin'
    message: string
  }
  orgId: string
}

interface IMemberInviteDelete {
  payload: {
    id: string
  }
  orgId: string
}

interface IVerifyInvite {
  orgId: string
  inviteId: string
}

const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSingleInvitation: builder.mutation<any, IMemberInvite>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/invitations`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['invitations']
    }),
    deleteInvitation: builder.mutation<any, IMemberInviteDelete>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/invitations/${payload.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['invitations']
    }),
    rejectInvitation: builder.mutation<any, IVerifyInvite>({
      query: ({ orgId, inviteId }) => ({
        url: `${orgId}/invitations/${inviteId}/reject`,
        method: 'POST'
      }),
      invalidatesTags: ['invitations']
    }),
    acceptInvitation: builder.mutation<any, IVerifyInvite>({
      query: ({ orgId, inviteId }) => ({
        url: `${orgId}/invitations/${inviteId}/confirm`,
        method: 'POST'
      }),
      invalidatesTags: ['invitations']
    }),
    getPendingInvites: builder.query({
      query: ({ orgId, params }) => {
        return {
          url: `${orgId}/invitations`,
          method: 'GET',
          params: {
            ...params
          }
        }
      },
      providesTags: ['invitations']
    }),
    getInvite: builder.query({
      query: ({ id }) => {
        return `/invite/${id}`
      },
      providesTags: ['invitations']
    }),
    verifyInvitation: builder.query<any, IVerifyInvite>({
      query: ({ orgId, inviteId }) => {
        return `${orgId}/invitations/${inviteId}/verify`
      },
      providesTags: ['invitations']
    }),
    reactivateInvite: builder.mutation<any, IVerifyInvite>({
      query: ({ orgId, inviteId }) => ({
        url: `${orgId}/invitations/${inviteId}/resend`,
        method: 'PUT'
      }),
      invalidatesTags: ['invitations']
    })
  })
})

export const {
  useCreateSingleInvitationMutation,
  useGetPendingInvitesQuery,
  useDeleteInvitationMutation,
  useVerifyInvitationQuery,
  useLazyVerifyInvitationQuery,
  useGetInviteQuery,
  useRejectInvitationMutation,
  useAcceptInvitationMutation,
  useReactivateInviteMutation
} = accountApi
