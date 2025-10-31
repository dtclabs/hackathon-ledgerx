/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import Router from 'next/router'
import { useAppDispatch } from '@/state'
import { setChain } from '@/slice/platform/platform-slice'
import { clearUserStates } from '@/utils/clearUserStates'
import { removeAccessToken } from '@/utils/localStorageService'
import { api } from '@/api-v2'
import { resetAccount, clearOrgList } from '@/slice/account/account-slice'

export const useWeb3Listener = () => {
  const { library, account, connector } = useWeb3React()
  const dispatch = useAppDispatch()

  const handleWeb3Updated = (payload) => {
    if (payload.chainId) {
      dispatch(setChain(String(parseInt(payload.chainId))))
    }
    if (payload.account && payload.account !== account) {
      // Wallet account changed (e.g., Phantom account switch). Reset auth/state and redirect.
      clearUserStates(dispatch)
      removeAccessToken()
      dispatch(api.util.resetApiState())
      dispatch(resetAccount())
      dispatch(clearOrgList())
      try {
        window.sessionStorage.removeItem('show_banner')
        window.sessionStorage.removeItem('show_banner_monetisation')
        window.sessionStorage.removeItem('wallets_synced')
      } catch (_) {
        // no-op
      }
      Router.push('/')
    }
  }

  const attachProviderListeners = () => {
    const provider = library?.provider
    if (!provider || typeof provider.on !== 'function') return () => undefined

    const onAccountsChanged = (accounts: string[]) => {
      const next = accounts?.[0]
      if (next && next !== account) {
        clearUserStates(dispatch)
        removeAccessToken()
        dispatch(api.util.resetApiState())
        dispatch(resetAccount())
        dispatch(clearOrgList())
        try {
          window.sessionStorage.removeItem('show_banner')
          window.sessionStorage.removeItem('show_banner_monetisation')
          window.sessionStorage.removeItem('wallets_synced')
        } catch (_) {
          // no-op
        }
        Router.push('/')
      }
    }

    const onDisconnect = () => {
      clearUserStates(dispatch)
      removeAccessToken()
      dispatch(api.util.resetApiState())
      Router.push('/')
    }

    provider.on?.('accountsChanged', onAccountsChanged)
    provider.on?.('disconnect', onDisconnect)

    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged)
      provider.removeListener?.('disconnect', onDisconnect)
    }
  }

  useEffect(() => {
    if (library && account && connector) {
      dispatch(setChain(String(parseInt(library.provider?.chainId))))
      connector.addListener('Web3ReactUpdate', handleWeb3Updated)
      const detachProvider = attachProviderListeners()
      return () => {
        connector.removeListener('Web3ReactUpdate', handleWeb3Updated)
        detachProvider?.()
      }
    }
    return undefined
  }, [library, account, dispatch, connector])
}

export default useWeb3Listener
