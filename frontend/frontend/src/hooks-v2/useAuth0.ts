/* eslint-disable no-promise-executor-return */
/* eslint-disable prefer-promise-reject-errors */

// Custom hook to handle Auth0 Authentication Logic

import auth0 from 'auth0-js'
import { useEffect, useRef } from 'react'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

interface IAuth0ServiceParams {
  path: string
  authO?: {
    domain?: string
    clientID?: string
    redirectUri?: string
    audience?: string
    responseType?: string
  }
}

interface IParamsLoginWithRedirect {
  code?: string
  redirectUri?: string
  organizationId?: string
}

const PROTOCOL = process.env.NEXT_PUBLIC_ENVIRONMENT === 'localhost' ? 'http://' : 'https://'
const AUTH0_REDIRECT_URL =
  process.env.NEXT_PUBLIC_HOSTED_URL === undefined ? 'localhost:3000' : process.env.NEXT_PUBLIC_HOSTED_URL

const useAuth0Service = ({ path, authO }: IAuth0ServiceParams) => {
  const auth0Client = useRef(null)

  useEffect(() => {
    auth0Client.current = new auth0.WebAuth({
      domain: authO?.domain ?? process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
      clientID: authO?.clientID ?? process.env.NEXT_PUBLIC_AUTH0_CLIENTID,
      redirectUri: authO?.redirectUri ?? `${PROTOCOL}${AUTH0_REDIRECT_URL}${path && path}`,
      audience: authO?.audience ?? process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      ...(authO?.responseType && { responseType: authO?.responseType })
    })
  }, [])

  const passwordlessEmailStart = ({ email }) =>
    new Promise((resolve, reject) =>
      auth0Client.current.passwordlessStart(
        {
          responseType: 'code',
          connection: 'email',
          send: 'code',
          email
        },
        (err, res) => {
          if (res) {
            resolve('')
          } else if (err) {
            reject()
          }
        }
      )
    )

  const passwordlessVerifyCode = ({ code, email }) =>
    new Promise((resolve, reject) =>
      auth0Client.current.passwordlessLogin(
        {
          responseType: 'code',
          connection: 'email',
          email,
          verificationCode: code
        },
        (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve('')
          }
        }
      )
    )

  const startGoogleAuth0Login = () => {
    auth0Client.current.authorize({
      responseType: 'code',
      connection: 'google-oauth2'
      // prompt: 'select_account'
    })
  }
  const startXeroAuth0Login = (redirectUri?: string) => {
    const config: { responseType: string; connection: string; redirectUri?: string } = {
      responseType: 'code',
      connection: 'xero-connection-offline'
    }
    if (redirectUri) config.redirectUri = redirectUri
    auth0Client.current.authorize(config)
  }

  const loginWithRedirect = async ({ code, redirectUri, organizationId }: IParamsLoginWithRedirect) => {
    await auth0Client.current.authorize({
      responseType: 'code',
      redirectUri: redirectUri ?? `${window.location.origin}/integrations/callback`, // ENV Variable later
      scope: 'openid profile email offline_access',
      state: organizationId ?? ''
    })
  }

  const loginWithPopup = async ({ organizationId }) => {
    await auth0Client.current?.popup?.authorize({
      redirect_uri: window.location.origin,
      responseType: 'code',
      clientId: 'YOUR_CLIENT_ID',
      scope: 'openid profile email offline_access',
      state: ''
    })
  }

  const getUserInfo = (accessToken, setInfo) => {
    auth0Client.current.client.userInfo(accessToken, (err, user) => {
      if (user?.family_name && user?.given_name) {
        setInfo(user.given_name, user.family_name, user.email)
      } else if (user?.email) {
        setInfo('', '', user.email)
      }
    })
  }

  return {
    passwordlessEmailStart,
    passwordlessVerifyCode,
    startGoogleAuth0Login,
    getUserInfo,
    loginWithRedirect,
    loginWithPopup,
    startXeroAuth0Login
  }
}

export default useAuth0Service
