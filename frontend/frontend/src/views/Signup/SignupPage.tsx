/* eslint-disable prefer-template */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-dupe-else-if */
/* eslint-disable no-else-return */
/* eslint-disable react/no-unescaped-entities */
import { toast } from 'react-toastify'
import { setAccessToken as setLocalAccessToken } from '@/utils/localStorageService'
import { useWeb3React } from '@web3-react/core'
import { useAppDispatch, useAppSelector } from '@/state'
import React, { useEffect, useState, useRef } from 'react'
import { TypographyV2 } from '@/components-v2'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import SignupForm from './components/SignupForm'
import SignUpStep2 from './components/SignupStep2'
import Stepper from './components/Stepper'
import { useRouter } from 'next/router'
import { useUpdateAuthenticatedAccountMutation, useLazyGetUserAccountQuery } from '@/api-v2/account-api'
import { useRegisterMutation, useLoginMutation, useAuthorizeMutation } from '@/slice/authentication/authentication.api'
import WalletSelectForm from '../../components/WalletSelectForm'
import CardEmailOTP from '@/components-v2/molecules/CardEmailOTP/EmailCodeForm'
import { accountSlice } from '@/slice/account/account-slice'
import useAuth0Service from '@/hooks-v2/useAuth0'
import IntroCard from '@/components/IntroCard'
import { log } from '@/utils-v2/logger'
import Image from 'next/legacy/image'
import Loading from '@/public/svg/Loader.svg'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import {
  IAuthType,
  setAccessToken,
  setAuthType,
  setUserInfo,
  userInfoSelector
} from '@/slice/authentication/auththentication.slice'
import { useCreateProvidersWalletMutation } from '@/api-v2/providers-wallet-api'
import useActivateWeb3Provider from '@/hooks-v2/useActivateWeb3Provider'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import loadingWalletConnect from 'public/svg/loading-wallet/wallet_connect_hq.svg'
import loadingMetaMask from 'public/svg/loading-wallet/metamask_hq.svg'

function parseJwt(token) {
  try {
    const base64Url = token?.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (err) {
    log.warning(
      // @ts-ignore TS2339
      err?.description ?? 'Error while parsing JWT on signup page',
      ['Error while parsing JWT on signup page'],
      {
        token: token || 'Token not available',
        actualErrorObject: err
      },
      `${window.location.pathname}`
    )
    return ''
  }
}

const SignUpPage: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const accessToken = useRef(null)
  const submitWalletLogin = useRef(false)
  const isAuthorizeCalled = useRef(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [triggerGetUserAccount] = useLazyGetUserAccountQuery()
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [triggerAuthorizeApi, authorizeApiResponse] = useAuthorizeMutation()
  const [passwordlessEmailError, setPasswordlessEmailError] = useState('')
  const [isPasswordlessLoading, setIsPasswordlessLoading] = useState(false)
  const [showCodeCard, setShowCard] = useState(false)
  const [passwordlessEmail, setPasswordlessEmail] = useState('')
  const [showWalletSelect, setShowWalletSelect] = useState(false)
  const [step, setStep] = useState(1)
  const [walletLoading, setWalletLoading] = useState<boolean>(false)
  const { active, account, library, deactivate } = useWeb3React()
  const { error, connectMetamaskWallet, connectWalletConnect } = useActivateWeb3Provider()
  const SignWalletProvider = useModalHook({ defaultState: { isOpen: true } })
  const memoryAccessToken = useAppSelector((state) => state.auth.accessToken)
  const isNewLoginEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewLoginEnabled'))
  const user = useAppSelector(userInfoSelector)

  const [updateMemberApi, updateMemberApiResult] = useUpdateAuthenticatedAccountMutation()
  const { passwordlessEmailStart, passwordlessVerifyCode, startXeroAuth0Login, startGoogleAuth0Login, getUserInfo } =
    useAuth0Service({
      path: '/signup?type=email&step=2',
      authO: {
        responseType: 'code'
      }
    })

  const [triggerRegisterApi, registerApiResults] = useRegisterMutation()
  const [triggerLoginApi, loginApiResult] = useLoginMutation()
  const [createProvidersWalletApi] = useCreateProvidersWalletMutation()

  const loginMethod = useRef(null)

  useEffect(() => {
    const walletLogin = loginMethod.current
    if (active && account && (walletLogin === 'metamask' || walletLogin === 'walletconnect')) {
      signWallet()
    }
  }, [active, account])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (memoryAccessToken && router.query?.type && ['email', 'xero'].includes(router.query?.type?.toString())) {
      getUserInfo(memoryAccessToken, (firstName, lastName, email) => {
        dispatch(
          setUserInfo({
            firstName,
            lastName,
            email
          })
        )
      })
    }
  }, [memoryAccessToken])

  useEffect(() => {
    if (authorizeApiResponse.isSuccess) {
      const authType = String(router.query.type) as IAuthType
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
            } else {
              // User has no org created - proceed to org create
              router.push('/organisation')
            }
          } else {
            // User has not yet added their firstname / last name  Go to step 2 to add user credentials
            setStep(2)
            router.push(
              `/signup?step=2&type=${authType}${router.query.inviteId ? `&inviteId=${router.query.inviteId}` : ''}`
            )
          }
        })
    }
  }, [authorizeApiResponse.isLoading, authorizeApiResponse.isError, authorizeApiResponse.isSuccess])

  useEffect(() => {
    const parsedHash = new URLSearchParams(window.location.search)
    const urlCode = parsedHash.get('code')
    if (!router.query.error && !window.location.hash?.includes('#error')) {
      if (
        router.query.step === '2' &&
        (router.query.type === 'wallet' || router.query.type === 'email' || router.query.type === 'xero')
      ) {
        setLoading(true)
        if (isNewLoginEnabled) {
          handleNewLogin()
        } else {
          handleLoginCheck()
        }
      } else {
        const signUpType = parsedHash.get('type')
        // Only Xero will have this state for now
        if (isNewLoginEnabled && urlCode && authorizeApiResponse?.isUninitialized && !isAuthorizeCalled.current) {
          isAuthorizeCalled.current = true
          dispatch(setAccessToken(urlCode))
          triggerAuthorizeApi({
            code: urlCode,
            provider: signUpType ?? 'xero'
          })
        }
      }
    }
  }, [router.query])

  const handleNewLogin = () => {
    if (!isAuthorizeCalled.current) {
      setStep(2)
      const parsedHash = new URLSearchParams(window.location.search)
      const urlAccessToken = parsedHash.get('code')
      const authType = String(router.query.type) as IAuthType
      dispatch(setAccessToken(urlAccessToken))
      dispatch(setAuthType(authType))
      isAuthorizeCalled.current = true
      triggerAuthorizeApi({
        code: urlAccessToken,
        provider: authType
      })
    }
  }

  function getAccessTokenFromUrl() {
    const hash = window.location.hash.substr(1) // Remove the '#' character
    const params = new URLSearchParams(hash) // Create a URLSearchParams object
    return params.get('access_token') // Retrieve the access_token value
  }

  const handleLoginCheck = async () => {
    const urlAccessToken = getAccessTokenFromUrl()
    dispatch(setAccessToken(urlAccessToken))

    let newToken = urlAccessToken || memoryAccessToken

    if (newToken) {
      window.sessionStorage.setItem('temp_auth0', newToken)
    } else {
      newToken = window.sessionStorage.getItem('temp_auth0')
    }

    await triggerLoginApi({
      token: newToken,
      provider: String(router.query.type)
    })
    dispatch(setAuthType(String(router.query.type) as IAuthType))

    accessToken.current = newToken
  }

  const handleXeroLogin = async () => {
    try {
      setLoading(true)
      startXeroAuth0Login(`${window.location.origin}/signup?type=xero&step=2`)
    } catch (e) {
      log.critical(
        // @ts-ignore TS2339
        err?.description ?? 'User faced error while logging in via xero',
        ['Error while trying to sign in via xero login'],
        {
          actualErrorObject: e
        },
        `${window.location.pathname}`
      )
    }
  }

  useEffect(() => {
    if (loginApiResult.isSuccess) {
      // User already has an account
      setLocalAccessToken(loginApiResult.data.accessToken)
      if (router.query.inviteId) {
        router.push(`/invite/${router.query.inviteId}`)
      } else if (loginApiResult.data.account.firstName === null) {
        setStep(2)
      } else if (loginApiResult.data.account.activeOrganizationId) {
        // Direct to dashboard
        router.push(`/${loginApiResult.data.account.activeOrganizationId}/dashboard`)
      } else {
        // Create org
        router.push('/organisation')
      }
    } else if (loginApiResult.isError) {
      if (loginApiResult.error.status === 404 && loginApiResult.error.data.message === 'Account does not exist') {
        triggerSendAnalysis({
          eventType: 'SIGN_UP',
          metadata: {
            type: loginApiResult?.originalArgs?.provider,
            action: 'step_1'
          }
        })
        setStep(2)
      } else if (router.query.type === 'wallet') {
        setStep(2)
      } else {
        setLoading(false)
        toast.error(loginApiResult.error.data.message ?? `${loginApiResult.error.status} there was an error logging in`)
      }

      log.error(
        `Signup login error with the following error code: ${loginApiResult?.error?.originalStatus}`,
        [`Signup login error with the following error code: ${loginApiResult?.error?.originalStatus}`],
        { actualErrorObject: loginApiResult?.error },
        `${window.location.pathname}`
      )
    }
  }, [loginApiResult])

  useEffect(() => {
    if (registerApiResults.isSuccess) {
      setLocalAccessToken(registerApiResults.data.accessToken)
      dispatch(accountSlice.actions.setAccount(registerApiResults.data.account))
      if (router.query.inviteId) {
        router.push(`/invite/${router.query.inviteId}`)
      } else {
        router.push('/organisation')
      }
    } else if (registerApiResults.isError) {
      log.error(
        'API error while signing up a new user with /auth/sign-up',
        ['API error while signing up a new user with /auth/sign-up'],
        { actualErrorObject: registerApiResults.error },
        `${window.location.pathname}`
      )
    }
  }, [registerApiResults])

  useEffect(() => {
    if (updateMemberApiResult.isSuccess) {
      dispatch(accountSlice.actions.setAccount(updateMemberApiResult?.data?.data))
      if (router.query.inviteId) {
        router.push(`/invite/${router.query.inviteId}`)
      } else if (updateMemberApiResult.data.activeOrganizationId) {
        // Direct to dashboard
        router.push(`/${updateMemberApiResult.data.activeOrganizationId}/dashboard`)
      } else {
        // Create org
        router.push('/organisation')
      }
    } else if (updateMemberApiResult.isError) {
      setLoading(false)
      if (updateMemberApiResult.error.status === 500) {
        log.critical(
          updateMemberApiResult.error?.data?.message ?? '500 Error while trying to update member on sign up page',
          ['500 Error while trying to update member on sign up page'],
          {
            actualErrorObject: updateMemberApiResult?.error
          },
          `${window.location.pathname}`
        )
        toast.error('Sorry, an unexpected error occured')
      } else if (updateMemberApiResult.error.status === 400) {
        log.error(
          updateMemberApiResult.error?.data?.message ?? '400 Error while trying to update member on sign up page',
          ['400 Error while trying to update member on sign up page'],
          {
            actualErrorObject: updateMemberApiResult.error
          },
          `${window.location.pathname}`
        )
        toast.error(updateMemberApiResult.error?.data?.message || 'Sorry, an error occured')
      } else {
        log.error(
          updateMemberApiResult.error?.data?.message ?? 'Error while trying to update member on sign up page',
          ['Error while trying to update member on sign up page'],
          {
            actualErrorObject: updateMemberApiResult.error
          },
          `${window.location.pathname}`
        )
        toast.error('Sorry, an error occured')
      }
    }
  }, [updateMemberApiResult])

  const handleConnectMetamask = async () => {
    setWalletLoading(true)
    loginMethod.current = 'metamask'
    try {
      await connectMetamaskWallet()
    } catch (err) {
      loginMethod.current = ''
      log.critical(
        // @ts-ignore TS2339
        err?.description ?? 'Error in opening metamask popup for sign-in',
        ['Error in opening metamask popup for sign-in'],
        {
          actualErrorObject: error
        },
        `${window.location.pathname}`
      )
    } finally {
      setWalletLoading(false)
    }
  }

  const handleConnectWalletConnect = async () => {
    loginMethod.current = 'walletconnect'
    try {
      await connectWalletConnect()
    } catch (err) {
      loginMethod.current = ''
      log.critical(
        // @ts-ignore TS2339
        err?.description ?? 'Error in opening walletconnect popup for sign-in',
        ['Error in opening walletconnect popup for sign-in'],
        {
          actualErrorObject: error
        },
        `${window.location.pathname}`
      )
    }
  }

  const handleEmailSubmit = async ({ email }) => {
    setPasswordlessEmail(email)
    setShowCard(true)
    setStep(1.5)
    try {
      await passwordlessEmailStart({ email })
    } catch (err) {
      log.error(
        'Error in sending password code for email sign up',
        ['Error in sending password code for email sign up'],
        {
          email,
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
      toast.error('Error requesting code')
    }
  }

  const signWallet = async () => {
    setWalletLoading(true)
    const { data: response }: any = await createProvidersWalletApi({ address: account, name: '' })
    submitWalletLogin.current = false
    if (response && response.data && response.data.nonce) {
      try {
        const { nonce } = response.data
        const signer = library.getSigner()
        const signature = await signer.signMessage(nonce)
        triggerLoginApi({
          provider: 'wallet',
          address: account,
          signature,
          token: ''
        })
        dispatch(setAuthType('wallet'))
      } catch (err) {
        deactivate()
        loginMethod.current = ''
        toast.error('User declined/was unable to sign the login request in their wallet')
        log.critical(
          // @ts-ignore TS2339
          err?.description ?? 'User declined/was unable to sign the login request in their wallet',
          ['Error while trying to sign in through a wallet'],
          {
            accountAddress: account,
            actualErrorObject: err
          },
          `${window.location.pathname}`
        )
      } finally {
        setWalletLoading(false)
      }
    }
  }

  const handleGoogleLogin = async () => {
    loginMethod.current = 'email'
    try {
      setLoading(true)
      startGoogleAuth0Login()
    } catch (e) {
      log.error(
        'User faced error while logging in via google',
        ['Error while trying to sign up via google login'],
        {
          actualErrorObject: e
        },
        `${window.location.pathname}`
      )
    }
  }

  const handleOnClickSubmit = (_data) => {
    triggerSendAnalysis({
      eventType: 'CLICK',
      metadata: {
        action: 'tos_accepted'
      }
    })
    triggerSendAnalysis({
      eventType: 'SIGN_UP',
      metadata: {
        action: 'step_2',
        type: router.query.type
      }
    })

    if (router.query.type === 'wallet') {
      updateMemberApi(_data)
    } else {
      const { firstName, lastName } = _data

      const provider = router.query.type ? router.query.type.toString() : 'email'

      if (isNewLoginEnabled) {
        updateMemberApi(_data)
      } else {
        triggerRegisterApi({
          provider,
          token: accessToken.current || memoryAccessToken,
          firstName,
          lastName,
          agreementSignedAt: new Date().toISOString()
        })
      }
    }
  }

  const onClickConnectWithWallet = () => {
    setShowWalletSelect(true)
  }

  const handleOnClickBack = () => {
    setLoading(false)
    setShowWalletSelect(false)
    setShowCard(false)
    setStep(1)
  }

  const handleRedirectSignup = () => {
    triggerSendAnalysis({
      eventType: 'CLICK_LINK',
      metadata: {
        action: 'already_signed_in'
      }
    })
    router.push('/')
  }

  const handleRequestCode = async () => {
    setPasswordlessEmailError('')
    setSending(true)
    try {
      await passwordlessEmailStart({ email: passwordlessEmail })
      toast.success('A new verification code has been sent')
      setSending(false)
    } catch (err) {
      log.error(
        'Error in sending password code when user clicked resend code on signup',
        ['Error in sending password code when user clicked resend code on signup'],
        {
          email: passwordlessEmail,
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
      setSending(false)

      toast.error('Error sending code')
    }
  }

  const onClickVerifyEmailCode = async (_data) => {
    setIsPasswordlessLoading(true)
    try {
      await passwordlessVerifyCode({ email: passwordlessEmail, code: _data.code })
      setIsPasswordlessLoading(false)
    } catch (err) {
      log.error(
        'Error while verifying passwordless code on sign up',
        ['Error while verifying passwordless code on sign up'],
        {
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
      // @ts-ignore
      setPasswordlessEmailError(err.description ?? 'Sorry an error occured')
      setIsPasswordlessLoading(false)
    }
  }

  const handleResetError = () => setPasswordlessEmailError('')
  // Quick Fix
  const renderCorrectStep = () => {
    if (step === 1 && showWalletSelect) {
      return (
        <WalletSelectForm
          handleOnClickSignUp={handleRedirectSignup}
          onClickWalletConnectSign={handleConnectWalletConnect}
          onClickMetamaskSign={handleConnectMetamask}
          onClickBack={handleOnClickBack}
        />
      )
    } else if (step === 2) {
      return (
        <SignUpStep2
          email={router.query.type === 'xero' ? user?.email : parseJwt(accessToken.current)?.['https://user/email']}
          onClickSubmit={handleOnClickSubmit}
          isLoading={
            authorizeApiResponse?.isLoading || registerApiResults?.isLoading || updateMemberApiResult?.isLoading
          }
        />
      )
    }

    return showCodeCard ? (
      <CardEmailOTP
        email={passwordlessEmail}
        onRequestCode={handleRequestCode}
        error={passwordlessEmailError}
        onClickSendCode={onClickVerifyEmailCode}
        onClickBack={handleOnClickBack}
        resetError={handleResetError}
        sending={sending}
        disabled={isPasswordlessLoading}
      />
    ) : (
      <SignupForm
        onClickGoogle={handleGoogleLogin}
        onClickSubmitEmail={handleEmailSubmit}
        onClickConnectWallet={onClickConnectWithWallet}
        onClickXeroSignIn={handleXeroLogin}
        onClickPhantom={async () => {
          // Mirror wallet flow: connect Phantom → get nonce → sign → login
          try {
            // @ts-ignore
            const provider = typeof window !== 'undefined' ? (window as any)?.solana : null
            if (!provider || !provider.isPhantom) {
              toast.info('Phantom not detected. Please install Phantom Wallet to continue.')
              return
            }
            loginMethod.current = 'wallet'
            setWalletLoading(true)
            const resp = await provider.connect()
            const publicKey = resp?.publicKey?.toString?.()
            if (!publicKey) {
              toast.error('Unable to read Phantom public key')
              setWalletLoading(false)
              return
            }

            const { data: nonceResp }: any = await createProvidersWalletApi({ address: publicKey, name: '' })
            const nonce = nonceResp?.data?.nonce
            if (!nonce) {
              toast.error('Unable to start wallet login')
              setWalletLoading(false)
              return
            }

            const encoded = new TextEncoder().encode(nonce)
            const signed = await provider.signMessage(encoded, 'utf8')
            const signature = signed?.signature

            await triggerLoginApi({ provider: 'wallet', address: publicKey, signature, token: '' })
            dispatch(setAuthType('wallet'))
          } catch (e) {
            loginMethod.current = ''
            toast.error('Unable to connect or sign with Phantom')
          } finally {
            setWalletLoading(false)
          }
        }}
        loading={loginApiResult.isLoading || updateMemberApiResult.isLoading || loading}
        initialEmail={router.query?.email ? String(router.query?.email) : ''}
      />
    )
  }

  return (
    <div className="bg-white sm:!h-full sm:mt-[124px] h-screen w-full overflow-hidden flex flex-col justify-center items-center font-inter">
      {updateMemberApiResult.isLoading ? (
        <div className="h-[620px] w-[950px] flex flex-col justify-center rounded-2xl shadow-loading">
          <Image src={Loading} className="animate-spin-slow" alt="loading" width={100} height={100} />
        </div>
      ) : (
        // <div className="flex flex-col items-center justify-center">
        <div>
          {/* <div className="mb-10 w-2/3">
            <Stepper step={step} />
          </div> */}
          {/* <div className="flex justify-center items-center font-inter isolate shadow-card"> */}
          {/* <IntroCard className="rounded-l-2xl" /> */}
          {/* <div className="bg-white rounded-r-2xl"> */}
          {renderCorrectStep()}
          <TypographyV2
            className="text-center pt-6 sm:fixed sm:bottom-4 sm:left-0 sm:right-[50%] sm:translate-x-[50%] sm:w-max"
            variant="subtitle2"
          >
            Already have an account?{' '}
            <span className="underline hover:cursor-pointer font-bold text-[#0079DA]" onClick={handleRedirectSignup}>
              Sign in
            </span>
          </TypographyV2>
          {/* </div> */}
          {/* </div> */}
        </div>
      )}
      {walletLoading && (loginMethod.current === 'metamask' || 'walletconnect') && (
        <BaseModal provider={SignWalletProvider} classNames="sm:w-full sm:mx-4">
          <BaseModal.Header extendedClass="flex justify-center">
            {/* <Image
              src={loginMethod.current === 'metamask' ? loadingMetaMask : loadingWalletConnect}
              alt="loading wallet"
            /> */}
            <img src="/svg/logos/ledgerx-logo.svg" alt="loading wallet" className="w-[154px] h-[40px]" />
          </BaseModal.Header>
          <BaseModal.Body>
            <TypographyV2 variant="subtitle" className="w-[500px] sm:!text-sm sm:w-full text-center p-2">
              Please sign the connection request received on your wallet to verify.
            </TypographyV2>
          </BaseModal.Body>
        </BaseModal>
      )}
    </div>
  )
}

export default SignUpPage
