import { createSlice, createSelector } from '@reduxjs/toolkit'
import { api } from '@/api-v2'
import { IntegrationName } from '@/api-v2/organization-integrations'

export enum OrgIntegrationStatus {
  COMPLETED = 'completed',
  INITIATED = 'initiated',
  TOKEN_SWAPPED = 'token_swapped',
  MIGRATING = 'migrating',
  FAILED = 'failed',
  DISCONNECTED_STANDBY = 'disconnected_standby'
}

export enum IntegrationWhitelistRequestStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
export interface OrgIntegration {
  integrationName: IntegrationName
  metadata: any
  status: OrgIntegrationStatus
}

export interface OrgIntegrationState {
  organizationIntegrations: OrgIntegration[]
}

const initialState: OrgIntegrationState = {
  organizationIntegrations: []
}

export const orgIntegrationSlice = createSlice({
  name: 'org-integration-slice',
  initialState,
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getAllOrganizationIntegrations.matchFulfilled,
      (state, { payload }) => {
        state.organizationIntegrations = payload
      }
    )
  },
  reducers: undefined
})
