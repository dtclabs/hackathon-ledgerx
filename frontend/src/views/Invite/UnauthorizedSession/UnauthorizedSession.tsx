import React from 'react'
import { Button } from '@/components-v2/Button'
import { Alert } from '@/components/Alert'

interface IInviteOption {
  orgName: string
  onClickSignin: () => void
  isError: boolean
  sessionError: boolean
  accessToken: string
}

const UnauthorizedSession: React.FC<IInviteOption> = ({
  orgName,
  onClickSignin,
  isError,
  accessToken,
  sessionError
}) => (
  <div className="block rounded-lg shadow-lg bg-white max-w-[600px] font-inter">
    <div className="p-8">
      <p className="text-grey-800 text-2xl text-center mb-10 font-bold leading-6">LedgerX.</p>
      <h3 className="text-dashboard-main text-[32px] text-center font-semibold leading-[48px]">
        {orgName} has invited you to their team.
      </h3>
      {sessionError || !accessToken ? (
        <p className="text-center mb-4 text-xl mt-4">Please sign in to accept the invitation.</p>
      ) : null}
      <p className="text-dashboard-main text-sm leading-5 text-center mt-8">
        You can use LedgerX to make transfers, receive payments and manage transactions.
      </p>
      {isError && accessToken && !sessionError ? (
        <Alert variant="danger" className="mt-5 text-base leading-6 font-medium py-3">
          You are logged in with the wrong account. Please sign in with the right account to accept the invitation.
        </Alert>
      ) : null}
    </div>

    <hr />
    <div className="p-8">
      <Button onClick={onClickSignin} size="xl" fullWidth>
        {isError ? 'Proceed to Sign In' : 'Proceed to Sign In'}
      </Button>
    </div>
  </div>
)

export default UnauthorizedSession
