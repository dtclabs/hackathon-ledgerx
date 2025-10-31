/* eslint-disable consistent-return */

import { useEffect, useRef, useState } from 'react'
import useActivateWeb3Provider from '../useActivateWeb3Provider'
import useStorage from '../utility/useStorage'
import { useAppSelector } from '@/state'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'

const useAutoConnectAccount = () => {
  const [initated, setInitiated] = useState(false)
  const inProgress = useRef(false)
  const { getItem } = useStorage('session')
  const { connectMetamaskWallet, connectWalletConnect } = useActivateWeb3Provider()
  const supportedChains = useAppSelector(supportedChainsSelector)

  useEffect(() => {
    const walletProvider = getItem('wallet-provider')

    if (walletProvider && !initated && supportedChains.length > 0 && !inProgress.current) {
      if (walletProvider === 'injected') {
        inProgress.current = true
        connectMetamaskWallet()
          .then((res) => {
            console.log('Connected to metamask')
          })
          .catch((err) => {
            // TODO - Handle Error case
            console.log('Error handling connect metamask')
          })
          .finally(() => {
            inProgress.current = false
            setInitiated(true)
          })
      } else if (walletProvider === 'wallet-connect') {
        setInitiated(true)
        connectWalletConnect()
      } else {
        inProgress.current = false
        setInitiated(true)
      }
    } else if (supportedChains.length > 0 && !initated) {
      setInitiated(true)
    }
  }, [supportedChains])

  return {
    isInitated: initated
  }
}

export default useAutoConnectAccount