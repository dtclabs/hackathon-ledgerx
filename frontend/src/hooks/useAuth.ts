import { useCallback, useEffect, useState } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector
} from '@web3-react/walletconnect-connector'
import { connectorLocalStorageKey, ConnectorNames, connectorsByName } from '@/utils/web3React'
import { setupNetwork } from '@/utils/wallet'
import { clearUserStates } from '../utils/clearUserStates'
import { useAppDispatch, useAppSelector } from '@/state'
import { ConnectingWalletEnum, userSelectors } from '@/state/user/reducer'
import { connectingWallet as connectingWalletAction } from '@/state/user/actions'
import { useRouter } from 'next/router'
import { GOERLI_TESTNET_CHAIN } from '@/constants/chains'
import { removeAccessToken } from '@/utils/localStorageService'
import { api } from '@/api-v2'
import { setAccessToken, setUserInfo } from '@/slice/authentication/auththentication.slice'
import { TXN_COLUMNS_STORAGE_KEY, TXN_FILTERS_STORAGE_KEY } from '@/views/Transactions-v2/interface'
import { clearOrgList } from '@/slice/account/account-slice'

interface IErrorWallet extends Error {
  code?: number
}

const useAuth = () => {
  const { account, activate, deactivate } = useWeb3React()
  const [logining, setLogining] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const connectingWallet = useAppSelector(userSelectors.connectingWalletSelector)
  const [redirectAuthenticate, setRedirectAuthenticate] = useState(false)
  const [status, setStatus] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!account && connectingWallet === ConnectingWalletEnum.Pending) {
      dispatch(connectingWalletAction(ConnectingWalletEnum.Done))
      setRedirectAuthenticate(true)
      setMessage('')
    }
  }, [connectingWallet, dispatch, account])

  const login = useCallback(
    async (connectorID: ConnectorNames, userAction = false) => {
      window.localStorage.setItem(connectorLocalStorageKey, connectorID)
      if (userAction) {
        dispatch(connectingWalletAction(ConnectingWalletEnum.Pending))
      }
      setLogining(true)
      const connector = connectorsByName[connectorID]
      if (connector) {
        // Support another network for Multisend app
        if (router.pathname === '/multisend' && connector.supportedChainIds) {
          if (!connector.supportedChainIds.includes(GOERLI_TESTNET_CHAIN))
            connector.supportedChainIds.push(GOERLI_TESTNET_CHAIN)
        }

        if (connectorID === 'injected') {
          await(connector as InjectedConnector).isAuthorized()
        }

        // await activate(connector, async (error: IErrorWallet) => {
        //   if (error instanceof UnsupportedChainIdError) {
        //     if (connectorID === ConnectorNames.WalletConnect) {
        //       setMessage('Please switch to Ethereum network')
        //       setLogining(false)
        //     } else {
        //       const hasSetup = await setupNetwork()
        //       // if (hasSetup) {
        //       //   activate(connector)
        //       // } else {
        //       //   setMessage('Please switch to Ethereum network')
        //       //   setStatus(true)
        //       // }
        //       setLogining(false)
        //     }
        //   } else {
        //     if (error instanceof NoEthereumProviderError) {
        //       setMessage('Please install Metamask.')
        //       setStatus(true)

        //       // toast.error('Please install Metamask.', { position: 'top-right' })
        //     } else if (
        //       error instanceof UserRejectedRequestErrorInjected ||
        //       error instanceof UserRejectedRequestErrorWalletConnect
        //     ) {
        //       if (connector instanceof WalletConnectConnector) {
        //         const walletConnector = connector
        //         walletConnector.walletConnectProvider = null
        //       }
        //     } else {
        //       if (error?.code === -32002) {
        //         setMessage('Please connect to your Wallet')
        //         // toast.warn('Please connect to your Wallet', {
        //         //   position: 'top-right'
        //         // })
        //         setStatus(true)
        //       }
        //     }
        //     setLogining(false)
        //   }
        // })
      } else {
        setLogining(false)
      }
    },
    [activate, dispatch]
  )
  const logout = useCallback(() => {
    deactivate()
    clearUserStates(dispatch)
    removeAccessToken()
    dispatch(api.util.resetApiState())
  }, [deactivate, dispatch])

  const logoutRedirect = useCallback(() => {
    deactivate()
    clearUserStates(dispatch)
    removeAccessToken()
    dispatch(api.util.resetApiState())
    dispatch(
      setUserInfo({
        firstName: '',
        lastName: '',
        email: ''
      })
    )
    dispatch(setAccessToken(null))
    dispatch(clearOrgList())

    window.sessionStorage.removeItem('show_banner')
    window.sessionStorage.removeItem('show_banner_monetisation')
    window.sessionStorage.removeItem('wallets_synced')
    window.sessionStorage.removeItem(TXN_FILTERS_STORAGE_KEY)
    window.sessionStorage.removeItem(TXN_COLUMNS_STORAGE_KEY)
    router.push('/')
  }, [deactivate, dispatch])

  return { login, logout, redirectAuthenticate, logining, setStatus, status, message, setLogining, logoutRedirect }
}

export default useAuth
