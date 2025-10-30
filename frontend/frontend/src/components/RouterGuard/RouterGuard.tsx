import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import { getAccessToken } from '@/utils/localStorageService'
import useStorage from '@/hooks/useLocalStorage'
// import useAuth from '@/hooks/useAuth'
import { ConnectorNames } from '@/utils/web3React'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { isMonetisationEnabled } from '@/config-v2/constants'
import { SubscriptionStatus, useGetSubscriptionQuery } from '@/api-v2/subscription-api'
import { useAppSelector } from '@/state'
import { cardOnboardingStepSelector } from '@/slice/cards/cards-slice'
import { CardOnboardingStatus } from '@/slice/cards/cards-type'

export const PUBLIC_PATH = [
  '/authenticate',
  '/multisend',
  '/invoice',
  '/signin',
  '/invite',
  '/signup',
  '/payments',
  '/integrations'
]
export const PRIVATE_PATH = ['/organisation']
const PUBLIC_PATH_NAMES = ['/[organizationId]']
const EMPLOYEE_WHITELIST_ROUTES = ['/account', '/profile']

export function RouteGuard({ children, userRole }) {
  const router = useRouter()
  // const { login } = useAuth()
  const activeOrganizationId = useOrganizationId()
  const {
    data: subscriptionPlan,
    isLoading,
    isFetching
  } = useGetSubscriptionQuery(
    { organizationId: activeOrganizationId },
    { skip: !activeOrganizationId || PUBLIC_PATH_NAMES.includes(router.pathname) }
  )
  const cardOnboardingStep = useAppSelector(cardOnboardingStepSelector)

  const [authorized, setAuthorized] = useState(false)
  const { getItem } = useStorage()
  const connectorIdv2 = getItem('connectorIdv2')

  useEffect(() => {
    authCheck(router.asPath)
    router.events.on('routeChangeComplete', authCheck)
    return () => {
      router.events.off('routeChangeComplete', authCheck)
    }
  }, [userRole, connectorIdv2])

  useEffect(() => {
    const path = router.pathname.split('/').slice(2).join('/')

    if (activeOrganizationId)
      if (
        cardOnboardingStep?.status &&
        cardOnboardingStep?.status === CardOnboardingStatus.COMPLETED &&
        path === 'cards'
      ) {
        router.push(`/${activeOrganizationId}/cards/list`)
      } else if (
        cardOnboardingStep?.status !== CardOnboardingStatus.COMPLETED &&
        ['cards/list', 'cards/account'].includes(path)
      ) {
        router.push(`/${activeOrganizationId}/cards`)
      }
  }, [activeOrganizationId, cardOnboardingStep?.status, router.pathname])

  useEffect(() => {
    const path = router.pathname.split('/')[2]
    if (
      !['transfer', 'pendingApproval', 'contacts', 'orgsettings'].includes(path) &&
      isMonetisationEnabled &&
      subscriptionPlan?.status === SubscriptionStatus.EXPIRED &&
      !isLoading &&
      !isFetching
    ) {
      router.push(`/${activeOrganizationId}/orgsettings?activeTab=pricingAndPlans`)
    }
  }, [activeOrganizationId, router.pathname, subscriptionPlan?.status, isLoading, isFetching])

  function authCheck(url: string) {
    const accessToken = getAccessToken()

    const path = url.split('?')[0]
    const isPrivateRoute = /\/([^/])+\/./.test(path) || PRIVATE_PATH.find((item) => path.includes(item))
    const isHomePage = path === '/'
    const isEmployeeAllowed = [...EMPLOYEE_WHITELIST_ROUTES, ...PUBLIC_PATH].find((route) => path.includes(route))

    // const connectMetamask = async () => {
    //   if (accessToken && connectorIdv2) {
    //     await login(connectorIdv2 as ConnectorNames, true)
    //   }
    // }

    if (path === '/signin' && accessToken) {
      router.push('/')
      return
    }

    if (userRole === 'Employee' && !isEmployeeAllowed && activeOrganizationId && accessToken) {
      router.push(`/${activeOrganizationId}/profile`)
      return
    }

    if (isHomePage || (isPrivateRoute && accessToken) || !isPrivateRoute || isEmployeeAllowed) {
      setAuthorized(true)
      // connectMetamask()
    } else {
      setAuthorized(false)
      router.push('/')
    }
  }

  return authorized && children
}
