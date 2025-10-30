import { useAppSelector } from '@/state'
import { selectUserOrganizations } from '@/slice/organization/organization.selectors'
import { useOrganizationId } from '@/utils/getOrganizationId'

export const useCurrentOrganization = () => {
  const organizationId = useOrganizationId()
  const userOrganisations = useAppSelector(selectUserOrganizations)
  const currentOrganization =
    userOrganisations && userOrganisations.find((organization) => organization.publicId === organizationId)
  return currentOrganization
}
