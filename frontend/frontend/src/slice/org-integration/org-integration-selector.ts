import { IntegrationName } from '@/api-v2/organization-integrations'
import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'
import { OrgIntegrationStatus } from './org-integration-slice'

const selectSelf = (state: AppState) => state.orgIntegration

export const accountingIntegrationSelector = createSelector(selectSelf, (state: AppState) =>
  state.organizationIntegrations?.find(
    (integration) =>
      [IntegrationName.XERO, IntegrationName.QUICKBOOKS].includes(integration.integrationName) &&
      [OrgIntegrationStatus.COMPLETED, OrgIntegrationStatus.TOKEN_SWAPPED].includes(integration.status)
  )
)

export const rootfiIntegrationSelector = createSelector(selectSelf, (state: AppState) =>
  state.organizationIntegrations?.find(
    (integration) =>
      [IntegrationName.XERO, IntegrationName.QUICKBOOKS].includes(integration.integrationName) &&
      ![OrgIntegrationStatus.INITIATED, OrgIntegrationStatus.DISCONNECTED_STANDBY].includes(integration.status) &&
      integration.platform === 'rootfi'
  )
)

export const integrationSelector = createSelector(selectSelf, (state: AppState) => state.organizationIntegrations)
