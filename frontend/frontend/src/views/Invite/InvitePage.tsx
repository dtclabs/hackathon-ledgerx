import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import {
  useLazyVerifyInvitationQuery,
  useGetInviteQuery,
  useRejectInvitationMutation,
  useAcceptInvitationMutation
} from '@/api-v2/invitation-api'

import LoadingOverlay from '@/components/InProcessToast/InProcessToast'
import { useLazyConnectOrgQuery } from '@/slice/organization/organization.api'
import { getAccessToken } from '@/utils/localStorageService'
import { AuthorizedSession } from '@/views/Invite/AuthorizedSession'
import { UnauthorizedSession } from '@/views/Invite/UnauthorizedSession'
import RejectedInvite from '@/views/Invite/RejectInvite/RejectInvite'
import AcceptedInvite from './AcceptedInvite/AcceptedInvite'
import { toast } from 'react-toastify'
import { Button } from '@/components-v2/Button'
import { useAppDispatch } from '@/state'
import { showWelcome } from '@/state/user/actions'
import useAuth from '@/hooks/useAuth'

const InvitePage: NextPage = (props) => {
  const router = useRouter()
  const { logout } = useAuth()
  const { publicId: inviteId } = router.query
  const {
    data: inviteData,
    error: inviteQueryError,
    isError: isInviteQueryError
  } = useGetInviteQuery({ id: inviteId }, { skip: !inviteId })
  const accessToken = getAccessToken()
  const dispatch = useAppDispatch()
  const [unhandledError, setUnhandledError] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rejectInviteApi, rejectInviteApiResult] = useRejectInvitationMutation()
  const [acceptInviteApi, acceptInviteApiResult] = useAcceptInvitationMutation()
  const [triggerConnectOrganization] = useLazyConnectOrgQuery()
  const [triggerVerifyApi, { isError: isVerifyError, error: verifyApiError, isSuccess }] = useLazyVerifyInvitationQuery(
    {}
  )

  useEffect(() => {
    if (isVerifyError || isInviteQueryError) {
      if (
        verifyApiError?.originalStatus === 500 ||
        inviteQueryError?.status === 500 ||
        inviteQueryError?.status === 404
      ) {
        // Handle unexpected error
        setUnhandledError(true)
      } else if (verifyApiError?.data.statusCode === 401) {
        setSessionError(true)
      }
      setLoading(false)
    }
  }, [isVerifyError, isInviteQueryError])

  useEffect(() => {
    if (isSuccess) {
      setLoading(false)
    }
  }, [isSuccess])

  useEffect(() => {
    if (inviteData?.data) {
      triggerVerifyApi({ orgId: inviteData?.data?.organizationId, inviteId: String(inviteId) })
    }
  }, [inviteData?.data, inviteId])

  useEffect(() => {
    if (rejectInviteApiResult.isSuccess) {
      toast.success('You have rejected thev invite', {
        position: 'top-right',
        pauseOnHover: false
      })
    }
  }, [rejectInviteApiResult])

  useEffect(() => {
    if (acceptInviteApiResult.isSuccess) {
      triggerConnectOrganization({ organisationId: inviteData?.data?.organizationId })
      router.push({
        pathname: `/${inviteData?.data?.organizationId}/profile`,
        query: {
          invited: true
        }
      })

      toast.success('You have Accepted the Invite', {
        position: 'top-right',
        pauseOnHover: false
      })
      dispatch(showWelcome(true))
    }
  }, [acceptInviteApiResult])

  const handleSigninNavigation = () => {
    logout()
    router.push({
      pathname: '/',
      query: {
        inviteId
      }
    })
  }

  const handleRejectinvite = () => {
    rejectInviteApi({ orgId: inviteData?.data?.organizationId, inviteId: String(inviteId) })
  }

  const handleAcccountJoin = () => {
    acceptInviteApi({ orgId: inviteData?.data?.organizationId, inviteId: String(inviteId) })
  }

  const handleRedirectToSignin = () => {
    logout()
    router.push('/')
  }

  if (acceptInviteApiResult.isSuccess) {
    return (
      <div className="flex h-screen justify-center items-center" style={{ backgroundColor: '#FBFAFA' }}>
        <AcceptedInvite orgName={inviteData?.data?.organizationName} />
      </div>
    )
  }

  if (rejectInviteApiResult.isSuccess) {
    return (
      <div className="flex h-screen justify-center items-center" style={{ backgroundColor: '#FBFAFA' }}>
        <RejectedInvite orgName={inviteData?.data?.organizationName} />
      </div>
    )
  }

  if (unhandledError) {
    return (
      <div className="flex h-screen justify-center items-center" style={{ backgroundColor: '#FBFAFA' }}>
        <div className="block rounded-lg shadow-lg bg-white max-w-sm font-inter">
          <div className="p-6">
            <p className="text-center mb-4">LedgerX.</p>
            <h3 className="text-xl mt-2  text-center">Looks like this invite does not exist</h3>
            <p className="text-xs text-center">
              Sign up to use LedgerX to make transfers, receive payments and manage transactions.
            </p>
          </div>

          <hr />
          <div className="p-4 flex gap-4 flex-row">
            <Button variant="contained" color="primary" onClick={handleRedirectToSignin} fullWidth>
              Proceed to login screen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen justify-center items-center" style={{ backgroundColor: '#FBFAFA' }}>
      {loading ? (
        <LoadingOverlay title="loading" />
      ) : (
        <div>
          {isVerifyError || !accessToken ? (
            <UnauthorizedSession
              isError={isVerifyError}
              accessToken={accessToken}
              onClickSignin={handleSigninNavigation}
              orgName={inviteData?.data?.organizationName}
              sessionError={sessionError}
            />
          ) : (
            <AuthorizedSession
              orgName={inviteData?.data?.organizationName}
              onReject={handleRejectinvite}
              onJoin={handleAcccountJoin}
              message={inviteData?.data?.message}
              isLoading={acceptInviteApiResult?.isLoading || rejectInviteApiResult?.isLoading}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default InvitePage
