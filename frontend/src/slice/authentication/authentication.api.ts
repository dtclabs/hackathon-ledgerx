/* eslint-disable arrow-body-style */
import { api } from '../../api-v2/index'
import {
  IRegisterParams,
  ILoginParams,
  IRegisterResponse,
  IAuthorizeParams,
  IAuthorizeResponse
} from './authentication.types'

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<IRegisterResponse, ILoginParams>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['accounts']
    }),
    register: builder.mutation<IRegisterResponse, IRegisterParams>({
      query: (data) => ({
        url: '/auth/sign-up',
        method: 'POST',
        body: data
      }),
      transformResponse: (res) => res.data
    }),
    authorize: builder.mutation<IAuthorizeResponse, IAuthorizeParams>({
      query: (data) => ({
        url: '/auth/authorize',
        method: 'POST',
        body: data
      }),
      transformResponse: (res) => res.data
    })
  })
})

export const { useLoginMutation, useRegisterMutation, useAuthorizeMutation } = authApi
