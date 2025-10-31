/* eslint-disable consistent-return */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'next/router'
import Image from 'next/legacy/image'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/state'
import React, { useEffect, useState, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import SignInForm from './components/SignInForm'
import { TypographyV2 } from '@/components-v2'
import WalletSelectForm from '../../components/WalletSelectForm'
import { useLoginMutation, useAuthorizeMutation } from '@/slice/authentication/authentication.api'
import CardEmailOTP from '@/components-v2/molecules/CardEmailOTP/EmailCodeForm'
import { toast } from 'react-toastify'
import useAuth0Service from '@/hooks-v2/useAuth0'
import useActivateWeb3Provider from '@/hooks-v2/useActivateWeb3Provider'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { setAccessToken as setLocalAccessToken } from '@/utils/localStorageService'
import {
  IAuthType,
  accessTokenSelector,
  setAccessToken,
  setAuthType,
  setUserInfo
} from '@/slice/authentication/auththentication.slice'
import { log } from '@/utils-v2/logger'
import IntroCard from '@/components/IntroCard'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useCreateProvidersWalletMutation } from '@/api-v2/providers-wallet-api'
import { useLazyGetUserAccountQuery } from '@/api-v2/account-api'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import loadingWalletConnect from 'public/svg/loading-wallet/wallet_connect_hq.svg'
import loadingMetaMask from 'public/svg/loading-wallet/metamask_hq.svg'
import { usePhantomMobileWallet } from '@/hooks-v2/usePhantomMobileWallet'
import { PublicKey } from '@solana/web3.js'
import useIsMobile from '@/hooks/useIsMobile'

const SignIn: React.FC = () => {
  const isNewLoginEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewLoginEnabled'))
  const token = useAppSelector(accessTokenSelector)
  const router = useRouter()
  const { library, active, account, deactivate } = useWeb3React()
  const dispatch = useAppDispatch()
  const [triggerGetUserAccount, getUserAccountResponse] = useLazyGetUserAccountQuery()
  const { error, connectMetamaskWallet, connectWalletConnect } = useActivateWeb3Provider()

  const [triggerAuthorizeApi, authorizeApiResponse] = useAuthorizeMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [triggerLoginApi, loginApiResult] = useLoginMutation()
  const [createProvidersWalletApi] = useCreateProvidersWalletMutation()
  const { connectPhantomMobile, isConnecting: isPhantomMobileConnecting } = usePhantomMobileWallet()

  const [loading, setLoading] = useState(false)
  const [walletLoading, setWalletLoading] = useState<boolean>(false)
  const [sending, setSending] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [isPasswordlessLoading, setIsPasswordlessLoading] = useState(false)
  const [showWalletSelectCard, setShowWalletSelectCard] = useState(false)
  const [passwordlessEmail, setPasswordlessEmail] = useState('')
  const [passwordlessEmailError, setPasswordlessEmailError] = useState('')
  const SignWalletProvider = useModalHook({ defaultState: { isOpen: true } })

  const { passwordlessEmailStart, passwordlessVerifyCode, startXeroAuth0Login, startGoogleAuth0Login, getUserInfo } =
    useAuth0Service({
      path: `/${router.query.inviteId ? `?inviteId=${router.query.inviteId}` : ''}`,
      authO: {
        responseType: 'code'
      }
    })

  const hasAccessToken = useRef(null)
  const loginMethod = useRef(null)

  const authType = sessionStorage.getItem('authType')

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
    if (token) {
      if (!isNewLoginEnabled) {
        getUserInfo(token, (firstName, lastName, email) => {
          dispatch(
            setUserInfo({
              firstName,
              lastName,
              email
            })
          )
        })
      }
    }
  }, [token])

  useEffect(() => {
    dispatch(setAuthType(sessionStorage.getItem('authType') as IAuthType))
  }, [authType])

  function getAccessTokenFromUrl() {
    const hash = window.location.hash.substr(1) // Remove the '#' character
    const params = new URLSearchParams(hash) // Create a URLSearchParams object
    return params.get('access_token') // Retrieve the access_token value
  }

  useEffect(() => {
    let accessToken = null
    if (isNewLoginEnabled) {
      const parsedHash = new URLSearchParams(window.location.search)

      accessToken = parsedHash.get('code')
    } else {
      accessToken = getAccessTokenFromUrl()
    }

    dispatch(setAccessToken(accessToken))
    if (accessToken && !hasAccessToken.current && !loginApiResult.isLoading) {
      setLoading(true)
      // Handle user login
      if (isNewLoginEnabled) {
        triggerAuthorizeApi({
          code: accessToken,
          provider: authType ?? 'xero'
        })
      } else {
        triggerLoginApi({
          provider: authType,
          token: accessToken
        })
      }
    }
    hasAccessToken.current = true
  }, [router.asPath])

  useEffect(() => {
    if (authorizeApiResponse.isSuccess) {
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
            router.push(
              `/signup?step=2&type=${authType}${router.query.inviteId ? `&inviteId=${router.query.inviteId}` : ''}`
            )
          }
        })
    } else if (authorizeApiResponse.isError) {
      setLoading(false)
      const errorMessage = authorizeApiResponse.error?.data?.message
      toast.error(errorMessage ?? 'Sorry, an error occured while trying to sign you in. Please try again later.')
      log.critical(
        'Error during Auth0 code exchange',
        ['Error during Auth0 code exchange'],
        {
          actualErrorObject: authorizeApiResponse.error
        },
        `${window.location.pathname}`
      )
    }
  }, [authorizeApiResponse.isLoading, authorizeApiResponse.isError, authorizeApiResponse.isSuccess])

  useEffect(() => {
    if (loginApiResult.isError) {
      if (loginApiResult.error.status === 404 && loginApiResult.error.data.message === 'Account does not exist') {
        router.push(
          `/signup?step=2&type=${authType}${router.query.inviteId ? `&inviteId=${router.query.inviteId}` : ''}`
        )
      } else {
        setLoading(false)
        log.debug(
          `Login error with the following error code: ${loginApiResult.error.originalStatus}`,
          [`Login error with the following error code: ${loginApiResult.error.originalStatus}`],
          loginApiResult?.error,
          `${window.location.pathname}`
        )
        toast.error(
          loginApiResult?.error?.data?.message ?? `${loginApiResult.error.status} there was an error logging in`
        )
      }
    } else if (loginApiResult.isSuccess) {
      triggerSendAnalysis({
        eventType: 'SIGN_IN',
        metadata: {
          loginType: loginMethod.current
        }
      })
      setLocalAccessToken(loginApiResult.data.accessToken)

      if (loginApiResult.data.account.firstName === null) {
        dispatch(setAccessToken(loginApiResult.data.accessToken))

        router.push(`/signup?step=2&type=wallet${router.query.inviteId ? `&inviteId=${router.query.inviteId}` : ''}`)
      } else if (router.query.inviteId) {
        router.push(`/invite/${router.query.inviteId}`)
      } else if (loginApiResult.data.account.activeOrganizationId) {
        router.push(`/${loginApiResult.data.account.activeOrganizationId}/dashboard?syncWallets=true`)
      } else {
        // Create org
        router.push('/organisation')
      }
    }
  }, [loginApiResult])

  const onClickWalletSignIn = () => {
    setShowWalletSelectCard(true)
  }

  const onClickMetamaskSignin = async () => {
    SignWalletProvider.methods.setIsOpen(true)
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
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
    } finally {
      setWalletLoading(false)
    }
  }
  const onClickWalletConnectSignin = async () => {
    loginMethod.current = 'walletconnect'
    try {
      SignWalletProvider.methods.setIsOpen(true)
      await connectWalletConnect()
    } catch (err) {
      loginMethod.current = ''
      log.critical(
        // @ts-ignore TS2339
        err?.description ?? 'Error in opening walletconnect popup for sign-in',
        ['Error in opening walletconnect popup for sign-in'],
        {
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
    }
  }

  const handleEmailSubmit = async (_data) => {
    const { email } = _data
    sessionStorage.setItem('authType', 'email')
    setPasswordlessEmail(email)
    try {
      await passwordlessEmailStart({ email })
      setShowCodeInput(true)
    } catch (err) {
      log.critical(
        // @ts-ignore TS2339
        err?.description ?? 'Error in sending password code for email sign-in',
        ['Error in sending password code for email sign-in'],
        {
          email,
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
      toast.error('Error sending code')
    }
  }

  const handleRequestCode = async () => {
    setPasswordlessEmailError('')
    setSending(true)
    try {
      await passwordlessEmailStart({ email: passwordlessEmail })
      toast.success('A new verification code has been sent')
      setSending(false)
    } catch (err) {
      log.critical(
        // @ts-ignore TS2339
        err?.description ?? 'Error in sending password code when user clicked resend code',
        ['Error in sending password code when user clicked resend code'],
        {
          email: passwordlessEmail,
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
      toast.error('Error sending code')
      setSending(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      startGoogleAuth0Login()
      sessionStorage.setItem('authType', 'email')
    } catch (e) {
      log.critical(
        // @ts-ignore TS2339
        err?.description ?? 'User faced error while logging in via google',
        ['Error while trying to sign in via google login'],
        {
          actualErrorObject: e
        },
        `${window.location.pathname}`
      )
      console.log('e', e)
    }
  }

  const handleXeroLogin = async () => {
    try {
      setLoading(true)
      startXeroAuth0Login()
      sessionStorage.setItem('authType', 'xero')
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

  const signWallet = async () => {
    setWalletLoading(true)
    const { data: response }: any = await createProvidersWalletApi({ address: account, name: '' })
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
        sessionStorage.setItem('authType', 'wallet')
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

  const handleOnClickBack = () => {
    setLoading(false)
    setShowWalletSelectCard(false)
    setShowCodeInput(false)
    router.replace('/', undefined, { shallow: true })
  }

  const handleRedirectSignup = () => {
    router.push('/signup')
  }

  const sendCode = async (_data) => {
    setIsPasswordlessLoading(true)
    try {
      await passwordlessVerifyCode({ email: passwordlessEmail, code: _data.code })
      setIsPasswordlessLoading(false)
    } catch (err) {
      // @ts-ignore TS2339
      if (err?.code === 'access_denied') {
        log.warning(
          // @ts-ignore TS2339
          err?.description ?? 'Error while verifying passwordless code',
          ['Error while verifying passwordless code'],
          {
            email: passwordlessEmail,
            actualErrorObject: err
          },
          `${window.location.pathname}`
        )
      } else {
        log.error(
          // @ts-ignore TS2339
          err?.description ?? 'Error while verifying passwordless code',
          ['Error while verifying passwordless code'],
          {
            email: passwordlessEmail,
            actualErrorObject: err
          },
          `${window.location.pathname}`
        )
      }
      // @ts-ignore
      setPasswordlessEmailError(err.description ?? 'Sorry an error occured')
      setIsPasswordlessLoading(false)
    }
  }

  const handleResetError = () => setPasswordlessEmailError('')

  const isMobile = useIsMobile()

  return (
    <div className="bg-white sm:h-full sm:mt-[124px] h-screen w-full overflow-hidden flex justify-center items-center font-inter isolate shadow-card">
      {/* <IntroCard className="rounded-l-2xl" /> */}
      <div>
        {showWalletSelectCard ? (
          <WalletSelectForm
            handleOnClickSignUp={handleRedirectSignup}
            onClickWalletConnectSign={onClickWalletConnectSignin}
            onClickMetamaskSign={onClickMetamaskSignin}
            onClickBack={handleOnClickBack}
            message=""
          />
        ) : showCodeInput ? (
          <CardEmailOTP
            resetError={handleResetError}
            email={passwordlessEmail}
            onRequestCode={handleRequestCode}
            error={passwordlessEmailError}
            onClickSendCode={sendCode}
            onClickBack={handleOnClickBack}
            sending={sending}
            disabled={isPasswordlessLoading}
          />
        ) : (
          <SignInForm
            onClickGoogleSignIn={handleGoogleLogin}
            onClickXeroSignIn={handleXeroLogin}
            onClickPasswordlessEmailSignIn={handleEmailSubmit}
            onClickPhantomSignIn={async () => {
              if (isMobile) {
                try {
                  loginMethod.current = 'phantom-mobile'
                  SignWalletProvider.methods.setIsOpen(true)
                  setWalletLoading(true)

                  const signInResult = await connectPhantomMobile()
                  if (!signInResult) return

                  const { address, signature, nonce } = signInResult
                  const publicKey = new PublicKey(address)

                  await triggerLoginApi({
                    provider: 'wallet',
                    address: publicKey.toBase58(),
                    signature,
                    token: nonce // ✅ same as desktop now
                  })

                  sessionStorage.setItem('authType', 'wallet')
                } catch (e) {
                  loginMethod.current = ''
                  log.critical(
                    'Error during Phantom mobile wallet login',
                    ['Error during Phantom mobile wallet login'],
                    {
                      actualErrorObject: e
                    },
                    `${window.location.pathname}`
                  )
                  toast.error('Unable to connect or sign with Phantom mobile wallet')
                } finally {
                  setWalletLoading(false)
                }
              } else {
                try {
                  // @ts-ignore
                  const provider = typeof window !== 'undefined' ? (window as any)?.solana : null
                  if (!provider || !provider.isPhantom) {
                    toast.info('Phantom not detected. Please install Phantom Wallet to continue.')
                    return
                  }
                  loginMethod.current = 'wallet'
                  SignWalletProvider.methods.setIsOpen(true)
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
                  sessionStorage.setItem('authType', 'wallet')
                } catch (e) {
                  loginMethod.current = ''
                  toast.error('Unable to connect or sign with Phantom')
                } finally {
                  setWalletLoading(false)
                }
              }
            }}
            onClickWalletSignIn={onClickWalletSignIn}
            loading={
              loginApiResult.isLoading ||
              loading ||
              authorizeApiResponse.isLoading ||
              getUserAccountResponse.isLoading ||
              isPhantomMobileConnecting
            }
            authType={authType}
          />
        )}
        <TypographyV2
          className="text-center pt-6 sm:absolute sm:bottom-4 sm:left-0 sm:right-[50%] sm:translate-x-[50%] sm:w-max"
          variant="subtitle2"
        >
          Don't have an account?{' '}
          <span className="underline hover:cursor-pointer font-bold text-[#0079DA]" onClick={handleRedirectSignup}>
            Sign up
          </span>
        </TypographyV2>
      </div>
      {walletLoading &&
        (loginMethod.current === 'metamask' ||
          loginMethod.current === 'walletconnect' ||
          loginMethod.current === 'phantom-mobile') && (
          <BaseModal provider={SignWalletProvider} classNames="sm:w-full sm:mx-4 relative">
            <BaseModal.Header extendedClass="flex justify-center">
              {/* <Image
              src={loginMethod.current === 'metamask' ? loadingMetaMask : loadingWalletConnect}
              alt="loading wallet"
            /> */}
              <img src="/svg/logos/ledgerx-logo.svg" alt="loading wallet" className="w-[154px] h-[40px]" />
              <div className="absolute right-4 top-4">
                <BaseModal.Header.CloseButton
                  onClose={() => {
                    setWalletLoading(false)
                    loginMethod.current = ''
                    SignWalletProvider.methods.setIsOpen(false)
                  }}
                />
              </div>
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

export default SignIn
