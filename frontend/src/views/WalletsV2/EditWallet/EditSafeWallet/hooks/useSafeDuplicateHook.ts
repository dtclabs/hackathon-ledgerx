/* eslint-disable no-promise-executor-return */
import { useState, useRef, useEffect } from 'react'
import { useAppSelector } from '@/state'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useSafeClient } from '@/hooks-v2/web3Hooks/useSafeClient'
import useEthersService from '@/hooks-v2/web3Hooks/useEthersService'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { NoWalletFound, WalletActionRejected } from '@/shared/error-types'
import { getProxyFactoryDeployment } from '@safe-global/safe-deployments'

interface IUseSafeDuplicateHook {
  wallet: {
    address: string
    blockchainId: string
  }
}

export type ISafeDeployStage = 'network-selection' | 'deploying-safe'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const useSafeDuplicateHook = ({ wallet }: IUseSafeDuplicateHook) => {
  const safeProxyAddress = useRef<string>('')
  const sourceSafeCreationInfo = useRef<any>(null)
  const [step, setStep] = useState<ISafeDeployStage>('network-selection')
  const [isCheckingTargetNetwork, setIsCheckingTargetNetwork] = useState<boolean>(false)
  const [isPendingTransaction, setIsPendingTransaction] = useState<boolean>(false)
  const [safeExists, setSafeExists] = useState<null | any>(null)
  const [targetChain, setTargetChain] = useState<string>('')

  const { library, account, chainId } = useWeb3React()
  const { switchNetwork, getTransaction, isEoaWallet } = useEthersService()
  const supportedChains = useAppSelector(supportedChainsSelector)
  const [isConnectedAccountCreator, setIsConnectedAccountCreator] = useState<string | null>(null)

  const { loadTempSafeClient } = useSafeClient({})

  useEffect(() => {
    const safeCreator = sourceSafeCreationInfo.current?.creator
    if (safeCreator && safeCreator.toLowerCase() !== account.toLowerCase()) {
      console.log('*** Safe creator does not match account ***')
      setIsConnectedAccountCreator(safeCreator)
    } else {
      setIsConnectedAccountCreator(null)
    }
  }, [account])

  const resetState = () => {
    setTargetChain('')
    setStep('network-selection')
    setIsCheckingTargetNetwork(false)
    setSafeExists(null)
    setIsPendingTransaction(false)
    setIsConnectedAccountCreator(null)
  }

  const checkTargetNetworkIsAvailable = async (_targetNetworkId) => {
    try {
      setIsCheckingTargetNetwork(true)
      console.log('ALL SUPPORTED WALLET CHAINS: ', wallet.blockchainId)
      console.log('ZERO INDEX WALLET BLOCKCHAIN ID: ', wallet.blockchainId[0])
      const walletNetwork = supportedChains.find((chain) => chain.id === wallet.blockchainId[0])
      const targetNetwork = supportedChains.find((chain) => chain.id === _targetNetworkId)

      const originalSafeClient = loadTempSafeClient({ rpcUrl: walletNetwork.rpcUrl, safeUrl: walletNetwork.safeUrl })
      const originalSafeCreationTx = await originalSafeClient?.getSafeCreationInfo({ address: wallet.address })
      const originalSafeInfo = await originalSafeClient?.getSafeInfo({ address: wallet.address })

      const originalSafeVersion = originalSafeInfo.version
      const targetChainProxyAddress = getProxyFactoryDeployment({
        version: originalSafeVersion
      })
      const mappedProxy = targetChainProxyAddress.networkAddresses[targetNetwork.chainId]
      console.log('SOURCE SAFE INFO: ', originalSafeInfo)
      console.log('SOURCE SAFE CREATION TX: ', originalSafeCreationTx)

      const safeCreationFactory = originalSafeCreationTx?.factoryAddress

      console.log('TARGET CHAIN MAPPED PROXY: ', mappedProxy)
      sourceSafeCreationInfo.current = originalSafeCreationTx
      safeProxyAddress.current = safeCreationFactory

      const safeCreator = originalSafeCreationTx?.creator
      if (safeCreator.toLowerCase() !== account.toLowerCase()) {
        console.log('*** Safe creator does not match account ***')
        setIsConnectedAccountCreator(safeCreator)
      }

      const targetNetworkSafeClient = loadTempSafeClient({
        rpcUrl: targetNetwork.rpcUrl,
        safeUrl: targetNetwork.safeUrl
      })
      console.log('target network', targetNetwork)

      const targetSafeProxyAddress = targetChainProxyAddress.networkAddresses[targetNetwork.chainId]

      console.log('targetSafeProxyAddress', targetSafeProxyAddress)

      console.log('*** Checking if Safe exists on target network ***')
      console.log('TARGET CHAIN PROXY ADDRESS: ', targetChainProxyAddress)

      const targetNetworkSafeCreationTx = await targetNetworkSafeClient?.getSafeCreationInfo({
        address: wallet.address
      })

      if (targetNetworkSafeCreationTx) {
        console.log('*** Safe already exists on target network ***')
        const targetNetworkSafeInfo = await targetNetworkSafeClient?.getSafeInfo({ address: wallet.address })
        setSafeExists(targetNetworkSafeInfo)
      }
    } catch (e: any) {
      if (e instanceof NoWalletFound) {
        console.log('*** No Safe found on target network ***')
      } else {
        throw new Error(e)
      }
    } finally {
      setIsCheckingTargetNetwork(false)
    }
  }

  const resyncChainData = async (_targetNetworkId) => {
    let isSafeFound = false
    try {
      setIsCheckingTargetNetwork(true)
      const targetNetwork = supportedChains.find((chain) => chain.id === _targetNetworkId)

      const targetNetworkSafeClient = loadTempSafeClient({
        rpcUrl: targetNetwork.rpcUrl,
        safeUrl: targetNetwork.safeUrl
      })

      console.log('*** Checking if Safe exists on target network ***')

      const targetNetworkSafeCreationTx = await targetNetworkSafeClient?.getSafeCreationInfo({
        address: wallet.address
      })

      if (targetNetworkSafeCreationTx) {
        console.log('*** Safe already exists on target network ***')
        const targetNetworkSafeInfo = await targetNetworkSafeClient?.getSafeInfo({ address: wallet.address })
        setSafeExists(targetNetworkSafeInfo)
        isSafeFound = true
      }
      setIsCheckingTargetNetwork(false)
      return isSafeFound
    } catch (e: any) {
      setIsCheckingTargetNetwork(false)
      if (e instanceof NoWalletFound) {
        console.log('*** No Safe found on target network ***')
      } else {
        console.log('UNknown error')
        // throw new Error(e)
      }
      return isSafeFound
    } 
  }

  const switchNetworkToTargetChain = async ({ targetNetworkId: _targetNetworkId }): Promise<boolean> => {
    const targetNetwork = supportedChains.find((chain) => chain.id === _targetNetworkId)
    setIsPendingTransaction(true)
    if (String(targetNetwork.chainId) !== String(chainId)) {
      console.log('*** Switching to target network to deploy Safe ***')
      const isSuccess = await switchNetwork({ chainId: targetNetwork.chainId })
      if (!isSuccess) {
        setIsPendingTransaction(false)
        return false
      }
      console.log(`*** Switched to target network to deploy Safe - ${_targetNetworkId} ***`)
    }
    setIsPendingTransaction(false)
    setStep('deploying-safe')
    return true
  }

  const triggerSafeDeployTransaction = async ({ transaction }) => {
    //  Function signature for `createProxy(bytes memory _data)`
    console.log('*** Triggering Safe deploy transaction ***')
    console.log('Safe Proxy Address: ', safeProxyAddress.current)

    const transactionData = {
      to: safeProxyAddress.current,
      data: transaction,
      gasLimit: ethers.utils.hexlify(1000000)
    }
    try {
      const signer = library.getSigner()
      const txResult = await signer.sendTransaction(transactionData)
      await txResult.wait()
    } catch (e: any) {
      // TODO - Better error handling
      if (e.message.includes('rejected')) {
        throw new Error('User rejected the wallet action')
      }
      throw new Error(e)
    }
  }

  const checkSafeDeployedSuccessfully = async ({ targetNetworkId: _targetNetworkId, address }): Promise<boolean> => {
    // TODO - Implement
    const maxAttempts = 4
    const targetNetwork = supportedChains.find((chain) => chain.id === _targetNetworkId)
    const targetNetworkSafeClient = loadTempSafeClient({
      rpcUrl: targetNetwork.rpcUrl,
      safeUrl: targetNetwork.safeUrl
    })
    let isSuccess = false
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`*** Checking if Safe was deployed successfully (Attempt ${attempt}) ***`)
        await targetNetworkSafeClient?.getSafeCreationInfo({ address })
        // Exit the loop if successful
        isSuccess = true
        break
      } catch (e: any) {
        console.log(`SAFE CREATION ERROR (Attempt ${attempt}): `, e)
        // Wait for 1 second before retrying if not the last attempt
        if (attempt < maxAttempts) {
          await sleep(3500)
        } else {
          // Handle the case where all attempts have failed
          console.log('All attempts to check Safe deployment have failed.')
        }
      }
    }
    setIsPendingTransaction(false)
    return isSuccess
  }

  const availableChains = () => {
    const remainingChains = supportedChains.filter((chain) => !wallet.blockchainId.includes(chain.id))
    return remainingChains
  }

  return {
    resyncChainData,
    checkTargetNetworkIsAvailable,
    triggerSafeDeployTransaction,
    switchNetworkToTargetChain,
    checkSafeDeployedSuccessfully,
    setIsPendingTransaction,
    isCheckingTargetNetwork,
    isPendingTransaction,
    safeExists,
    availableChains,
    targetChain,
    setTargetChain,
    isConnectedAccountCreator,
    resetState,
    step
  }
}

export default useSafeDuplicateHook
