import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '@/state'
import { api } from '@/api-v2'

export interface IAccount {
  activeOrganizationId: null | string
  createdAt: string
  deletedAt: null | string
  emailAccounts: any
  firstName: string | null
  id: string
  image: string | null
  lastName: string
  name: string
  updatedAt: string
}

interface IUserOrganizations {
  name: string
  id: string
  type: string
}

export interface IAccountState {
  account: IAccount | null
  traceId: string | null
  accountOrg: any
  userOrganisations: IUserOrganizations[] | []
}

const initialState: IAccountState = {
  accountOrg: null,
  account: null,
  traceId: null,
  userOrganisations: []
}

export const accountSlice = createSlice({
  name: 'account-slice',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<IAccount>) => {
      state.account = action.payload
    },
    resetAccount: (state, action: PayloadAction) => {
      // TODO: This is temporary to test out whether useAuth is actually being used, otherwise remove it
      state.account = undefined
    },
    clearOrgList: (state) => {
      state.userOrganisations = []
    },
    addOrg: (state, action: PayloadAction<IUserOrganizations>) => {
      state.userOrganisations = [...state.userOrganisations, action.payload]
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        // @ts-ignore
        api.endpoints.getUserAccount.matchFulfilled,
        (state, { payload }) => {
          state.account = payload.data
          state.traceId = `${payload.data?.id}-${Math.floor(Date.now() / 1000)}`
        }
      )
      .addMatcher(
        // @ts-ignore
        api.endpoints.getUserOrgAccount.matchFulfilled,
        (state, { payload }) => {
          const activeOrganizationIdFromURL = window.location.pathname.split('/')[1]
          const activeOrganizationData = payload?.data?.find(
            (org) => org?.publicId === `${activeOrganizationIdFromURL}`
          )
          state.accountOrg = activeOrganizationData?.members[0]?.role

          state.userOrganisations = payload.data.map((org) => ({ name: org.name, id: org.publicId, type: org.type }))
        }
      )
  }
})

const selectSelf = (state: AppState) => state.accountV2

export const accountSelectorV2 = createSelector(selectSelf, (state) => state.account)
export const traceIdSelector = createSelector(selectSelf, (state) => state.traceId)
export const userOrganizationPermissionSelector = createSelector(selectSelf, (state) =>
  state.accountOrg?.permissions?.map((permission) => `${permission.resource}.${permission.action}`)
)
export const userOrganizationsSelector = createSelector(selectSelf, (state) => state.userOrganisations)

export const { clearOrgList, addOrg } = accountSlice.actions
