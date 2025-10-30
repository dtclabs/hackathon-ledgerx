import { createSlice } from '@reduxjs/toolkit'
import { IOrganization } from './organization.types'
import { organizationApi } from './organization.api'

interface IOrganizationSliceState {
  data: any
  userOrganizations: IOrganization[] | []
}

const initialState: IOrganizationSliceState = {
  data: null,
  userOrganizations: []
}

export const organizationSlice = createSlice({
  name: 'organization-slice',
  initialState,
  reducers: undefined,
  extraReducers: (builder) => {
    builder.addMatcher(organizationApi.endpoints.getUsersOrganizations.matchFulfilled, (state, { payload }) => {
      state.userOrganizations = payload?.data
    })
  }
})
