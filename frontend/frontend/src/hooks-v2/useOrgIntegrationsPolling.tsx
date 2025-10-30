import { useEffect, useState } from 'react'
import {
  IntegrationName,
  useGetAllOrganizationIntegrationsQuery,
  useGetOrganizationIntegrationQuery
} from '@/api-v2/organization-integrations'
import { OrgIntegrationStatus } from '@/slice/org-integration/org-integration-slice'
import { useAppSelector } from '@/state'

const useOrgIntegrationsPolling = ({ organizationId }) => {
  const rootfiService = useAppSelector((state) => state.featureFlag?.rootfiService)
  const [pollingInterval, setPollingInterval] = useState(0)
  const [currentIntegration, setCurrentIntegration] = useState(null)

  const { data } = useGetAllOrganizationIntegrationsQuery(
    { organizationId },
    { skip: !organizationId, pollingInterval }
  )
  // To get xero timezone
  const { data: rootfiIntegration } = useGetOrganizationIntegrationQuery(
    { organizationId, integrationName: currentIntegration?.integrationName },
    { skip: !organizationId || currentIntegration?.integrationName !== IntegrationName.XERO, pollingInterval }
  )

  useEffect(() => {
    if (!rootfiService?.isEnabled) return
    const migratingIntegration = data?.find((integration) => integration?.platform === 'rootfi')
    setCurrentIntegration(migratingIntegration)

    if (currentIntegration?.status === OrgIntegrationStatus.MIGRATING) {
      setPollingInterval(3000)
      return
    }

    // polling xero integration to get timezone
    if (
      [OrgIntegrationStatus.COMPLETED, OrgIntegrationStatus.TOKEN_SWAPPED].includes(rootfiIntegration?.status) &&
      !rootfiIntegration?.metadata?.timezone
    ) {
      setPollingInterval(3000)
      return
    }

    setPollingInterval(0)
  }, [data, rootfiService, rootfiIntegration, currentIntegration])

  return { data, rootfiIntegration }
}
export default useOrgIntegrationsPolling
