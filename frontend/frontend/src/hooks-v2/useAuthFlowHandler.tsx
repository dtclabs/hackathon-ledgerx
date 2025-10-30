import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import useAuth0Service from '@/hooks-v2/useAuth0'
import Auth0Service from '@/services/auth0-service'

const useAuthFlowHandler = () => {
  const router = useRouter()
  const auth0 = new Auth0Service()

  const isNewLoginEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewLoginEnabled'))
  const { passwordlessEmailStart } = useAuth0Service({
    path: `/${router.query.inviteId ? `?inviteId=${router.query.inviteId}` : ''}`,
    authO: {
      responseType: 'code'
    }
  })

  const handlePasswordlessEmailFlow = async (_email: string) => {
    const response = await passwordlessEmailStart({ email: _email })
  }

  return {
    handlePasswordlessEmailFlow
  }
}

export default useAuthFlowHandler
