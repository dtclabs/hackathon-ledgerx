import { useRouter } from 'next/router'

export const useOrganizationId = () => {
  const route = useRouter()
  return route.query.organizationId as string
}
