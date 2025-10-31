/* eslint-disable no-useless-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-prototype-builtins */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/state'
import { getAccessToken } from '@/utils/localStorageService'
import { userOrganizationPermissionSelector } from '@/slice/account/account-slice'
import { useGetUserOrgAccountQuery } from '@/api-v2/account-api'
import { LoaderLX } from '@/components-v2/LoaderLX'

const PUBLIC_ROUTES = {
  '/': '',
  '/signup': '',
  '/multisend': ''
}

const PROTECTED_ROUTES = {
  '/[organizationId]/dashboard': 'transactions.read', // TEMP
  '/[organizationId]/transfer': 'transfers.read',
  '/[organizationId]/payme': 'payment_links.read',
  '/[organizationId]/pendingApproval': 'transactions.read',
  '/[organizationId]/wallets': 'wallets.read',
  '/[organizationId]/wallets/import': 'wallets.create',
  '/[organizationId]/transactions': 'transactions.read',
  '/[organizationId]/assets': 'assets.read',
  '/[organizationId]/categories': 'categories.read',
  '/[organizationId]/contacts': 'recipients.read',
  '/[organizationId]/members': 'settings.read',
  '/[organizationId]/orgsettings': 'settings.read'
}

const RouteGuard = ({ children }) => {
  const { status } = useGetUserOrgAccountQuery({})
  // const initialized = useRef(false)
  const [init, setInit] = useState(false)
  const router = useRouter()
  const accessToken = getAccessToken()
  const userPermissions = useAppSelector(userOrganizationPermissionSelector)

  useEffect(() => {
    if (!init && status !== 'pending') {
      setInit(true)
    }
    authCheck()
  }, [userPermissions, accessToken, router.asPath, status])

  function authCheck() {
    if (init) {
      if (PROTECTED_ROUTES.hasOwnProperty(router.pathname)) {
        const requiredPermission = PROTECTED_ROUTES[router.pathname]
        const hasPermission = userPermissions?.includes(requiredPermission)
        if (!hasPermission) {
          router.push('/')
          return
        }
      } else if (PUBLIC_ROUTES.hasOwnProperty(router.pathname)) {
        if (accessToken) {
          router.push('/')
          return
        }
      }
    }
  }

  if (!init) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderLX />
      </div>
    )
  }

  return children
}

export default RouteGuard
