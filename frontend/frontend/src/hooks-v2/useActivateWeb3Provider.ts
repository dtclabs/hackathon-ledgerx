/* eslint-disable consistent-return */
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { InjectedConnector } from '@web3-react/injected-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { useAppSelector } from '@/state'
import { ethers, utils } from 'ethers'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { CustomWalletConnectConnector } from '@/config-v2/connectors/wallet-connect-connector'
import { useEffect, useState } from 'react'
import useStorage from './utility/useStorage'

const useActivateWeb3Provider = () => {
  const { setItem } = useStorage('session')
  const [localError, setLocalError] = useState('')
  const { activate, error } = useWeb3React()
  const supportedChains = useAppSelector(supportedChainsSelector)
  const supportedChainIds = supportedChains.map((chain) => parseInt(chain.chainId))

  useEffect(() => {
    // TODO - Handle other edge cases
    if (error instanceof UnsupportedChainIdError) {
      const defaultChain = supportedChains.find((chain) => chain.id === 'ethereum')
      const formattedChainId = utils.hexValue(parseFloat(defaultChain?.chainId))
      switchDisconnecteWalletNetwork(formattedChainId)
    }
  }, [error])

  const connectMetamaskWallet = async () => {
    setLocalError('')
    if (typeof window.ethereum === 'undefined') {
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    try {
      const injectedConnector = new InjectedConnector({
        supportedChainIds
      })
      await activate(injectedConnector)
      setItem('wallet-provider', 'injected')
    } catch (err) {
      sentryCaptureException(err ?? error)
      console.log('Metamask Connection Error: ', err)
    }
  }

  const connectWalletConnect = async () => {
    setLocalError('')
    try {
      if (supportedChainIds.length === 0) {
        throw new Error('No Chains - Handle this gracefully')
      }
      // supportedChains items have `apiUrl` (not `rpcUrl`); build WalletConnect RPC map from that
      const chainIdRpcMap = supportedChains.reduce(
        (acc, { chainId, apiUrl }) => ({
          ...acc,
          [chainId]: apiUrl
        }),
        {}
      )
      const walletconnectConnector = new CustomWalletConnectConnector({
        // @ts-ignore
        supportedChainIds,
        rpcMap: chainIdRpcMap
      })
      await activate(walletconnectConnector)
      setItem('wallet-provider', 'wallet-connect')
    } catch (err) {
      sentryCaptureException(err)
      console.log('WalletConnect Connection Error: ', err)
    }
  }

  // TODO - Move this to a service in future
  async function switchDisconnecteWalletNetwork(chainId = '0x1') {
    // Check for ethereum object, this covers MetaMask and similar wallets
    if (window.ethereum && typeof window.ethereum.request === 'function') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        })
      } catch (_error: any) {
        // TODO - Handle the case where the network has not been added
        if (_error.code === 4902) {
          // Here add logic to add network
          console.error('Network not found', error)
        } else if (_error.code === 4001) {
          // Handle user rejection
          setLocalError('User rejected network switch')
        } else {
          setLocalError('Error switching network')
        }
      }
    } else {
      // Handle non-ethereum object wallets
      // This is where you'd implement wallet-specific logic E.g WalletConnect:
      // if (window.walletConnect && typeof window.walletConnect.switchChain === 'function') {
      //   try {
      //     await window.walletConnect.switchChain(chainId);
      //   } catch (error) {
      //     console.error('Error switching network with WalletConnect', error);
      //   }
      // }
      // Add more `else if` blocks for other wallets
      setLocalError('Please install Metamask to connect to the application.')
    }
  }

  return { error: localError, connectMetamaskWallet, connectWalletConnect }
}

export default useActivateWeb3Provider
