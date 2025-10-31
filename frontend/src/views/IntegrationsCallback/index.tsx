import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { LoaderLX } from '@/components-v2'
import { useAppDispatch } from '@/state'
import { IErrorHandler } from './integrations-callback.types'
import { useLazyGetUserAccountQuery } from '@/api-v2/account-api'
import { IntegrationErrorCard } from './components'
import { setUserInfo } from '@/slice/authentication/auththentication.slice'
import useStorage from '@/hooks-v2/utility/useStorage'
import { useAuthorizeMutation } from '@/slice/authentication/authentication.api'
import { useIntegrateThirdPartyAppMutation } from '@/api-v2/organization-integrations'
import { setAccessToken as setLocalAccessToken } from '@/utils/localStorageService'
import { toast } from 'react-toastify'
import useSendAnalysis from '@/hooks-v2/events/useSendAnalysis'

const XERO_STORE_LINK = process.env.NEXT_PUBLIC_XERO_STORE_LINK

const IntegrationsCallbackView = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { getItem, setItem } = useStorage('session')
  const sendEvent = useSendAnalysis()
  const urlCode = router.query.code
  const organizationId = getItem('organizationId')
  const integrationType = getItem('integration-type')
  const [integrationError, setIntegrationError] = useState<IErrorHandler>({
    provider: null,
    errorType: null,
    message: null
  })
  const [triggerAuthorizeApi, authorizeApiResponse] = useAuthorizeMutation()
  const [triggerGetUserAccount, getUserAccountResponse] = useLazyGetUserAccountQuery()
  const [triggerIntegrateApp, integrateAppApi] = useIntegrateThirdPartyAppMutation()

  const type = router?.query?.type

  useEffect(() => {
    if (type === 'xero-store' && !urlCode) {
      setTimeout(() => {
        // TODO - Had to remove this due to false positiives in the funnel as returning users are not "signing up"
        // sendEvent('SIGN_UP', { action: 'step_1', type: 'xero-store' })
        setItem('integration-type', 'xero-store')

        router.push(XERO_STORE_LINK)
      }, 1500)
    }
  }, [type])

  useEffect(() => {
    if (organizationId && integrationType && urlCode) {
      triggerIntegrateApp({
        organizationId,
        body: {
          integrationName: integrationType,
          code: urlCode as string,
          redirectUri: `${window.location.origin}/integrations/callback`
        }
      })
    } else if (!organizationId && integrationType === 'xero-store' && urlCode) {
      triggerAuthorizeApi({
        provider: 'xero',
        code: urlCode as string
      })
    }
  }, [urlCode, organizationId, integrationType])

  useEffect(() => {
    if (authorizeApiResponse?.isError) {
      if (integrationType === 'xero-store') {
        setIntegrationError({
          provider: 'xero',
          errorType: authorizeApiResponse?.error?.data?.message,
          message: authorizeApiResponse?.error?.data?.message
        })
      }
      // Todo - Add trigger for unknown error
      const errorMessage = authorizeApiResponse?.error?.data?.message ?? 'Sorry, an error occured'
      toast.error(errorMessage)
    } else if (authorizeApiResponse?.isSuccess) {
      // TODO - Create centralizied auth hook - Sign in is using same logic
      // TODO - Deprecate this local storage hook to new one
      setLocalAccessToken(authorizeApiResponse.data.accessToken)
      triggerGetUserAccount({})
        .unwrap()
        .then((res) => {
          dispatch(
            setUserInfo({
              firstName: res?.data?.firstName ?? '',
              lastName: res?.data?.lastName ?? '',
              email: res?.data?.name ?? ''
            })
          )
          if (
            (!authorizeApiResponse?.data?.isNewAccount &&
              authorizeApiResponse?.data.account.firstName &&
              authorizeApiResponse?.data?.account.lastName) ||
            authorizeApiResponse?.data?.account?.xeroAccounts?.length > 0
          ) {
            // User has already completed step 2 (Adding first name / last name)
            if (router.query?.inviteId) {
              router.push(`/invite/${router.query.inviteId}`)
            } else if (res?.data?.activeOrganizationId) {
              // User already has an org - Proceed to login
              router.push(`/${res.data.activeOrganizationId}/dashboard?syncWallets=true`)
              sendEvent('SIGN_IN', { type: 'xero-store' })
            } else {
              // User has no org created - proceed to org create
              sendEvent('SIGN_UP', { action: 'step_2', type: 'xero-store' })
              router.push('/organisation')
            }
          } else {
            // User has not yet added their firstname / last name  Go to step 2 to add user credentials
            router.push(`/signup?step=2&type=xero${router.query.inviteId ? `&inviteId=${router.query.inviteId}` : ''}`)
          }
        })
    }
  }, [authorizeApiResponse])

  useEffect(() => {
    if (integrateAppApi.isSuccess) {
      setItem('integration-type', '')
      if (!organizationId) {
        toast.error('Sorry, an error occured')
        router.push('/')
      } else {
        toast.success('Successfully connected to Request Finance')
        router.push(`/${organizationId}/integrations`)
      }
      // router.back()
    } else if (integrateAppApi.isError) {
      toast.error(
        integrateAppApi?.error?.data?.statusCode === 403
          ? integrateAppApi?.error?.data?.message // TODO: change to specific error message
          : 'Sorry, an error occured'
      )
      if (!organizationId) {
        router.push('/')
      } else {
        router.push(`/${organizationId}/integrations`)
      }
    }
  }, [integrateAppApi.isError, integrateAppApi.isSuccess])

  const handleOnClickRetryLogin = () => {
    if (integrationError.provider === 'xero') {
      setIntegrationError({
        provider: null,
        errorType: null,
        message: null
      })
      setItem('integration-type', 'xero-store')
      router.push(XERO_STORE_LINK)
    }
  }
  return (
    <div style={{ backgroundColor: '#FBFAFA' }} className="flex h-screen  flex-col items-center justify-center">
      {integrationError.provider ? (
        <IntegrationErrorCard onClickRetry={handleOnClickRetryLogin} error={integrationError} />
      ) : (
        <LoaderLX />
      )}
    </div>
  )
}

export default IntegrationsCallbackView
