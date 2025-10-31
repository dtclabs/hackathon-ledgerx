import { useRef, useEffect } from 'react'
import { useAppSelector } from '@/state'

import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { SafeClient, ISafeConfirmTransaction } from '@/services/safe-client.service'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { ProposeTransactionProps } from '@gnosis.pm/safe-service-client'

interface IUseSafeOptions {
  skip?: boolean
}

interface IUseSafeClientParams {
  rpcUrl?: string
  safeUrl?: string
  options?: IUseSafeOptions
}

export const useSafeClient = ({ rpcUrl, safeUrl, options }: IUseSafeClientParams) => {
  const safeClientServiceRef = useRef<SafeClient | null>(null)
  const selectedChain = useAppSelector(selectedChainSelector)

  // Initialize or reinitialize when dependencies change
  useEffect(() => {
    const rpcUrlToUse = rpcUrl ?? selectedChain?.apiUrl
    const safeUrlToUse = safeUrl ?? selectedChain?.safeUrl
    const skip = options?.skip

    if ((rpcUrlToUse || safeUrlToUse) && !skip) {
      try {
        console.log('Initializing SafeClient with', rpcUrlToUse, safeUrlToUse)
        safeClientServiceRef.current = new SafeClient({ rpcUrl: rpcUrlToUse, safeUrl: safeUrlToUse })
      } catch (err) {
        console.log('Error initializing SafeClient', err)
      }
    }
  }, [rpcUrl, safeUrl, selectedChain])

  // Function to reinitialize Safe Service with new RPC URL or Safe address
  const reinitializeSafeService = ({ rpcUrl: _rpcUrl, safeUrl: _safeUrl }) => {
    if (_rpcUrl && _safeUrl) {
      safeClientServiceRef.current = new SafeClient({ rpcUrl: _rpcUrl, safeUrl: _safeUrl })
    }
  }

  const loadTempSafeClient = ({ rpcUrl: _rpcUrl, safeUrl: _safeUrl }) => {
    const tempSafeClient = new SafeClient({ rpcUrl: _rpcUrl, safeUrl: _safeUrl })
    return tempSafeClient
  }

  const decodeData = async ({ data }) => safeClientServiceRef.current?.decodeData({ data })
  const getSafeCreationInfo = async ({ address }) => safeClientServiceRef.current?.getSafeCreationInfo({ address })
  const getBalances = async ({ address }) => safeClientServiceRef.current?.getBalances({ address })
  const getNextNonce = async ({ address }) => safeClientServiceRef.current?.getNextNonce({ address })
  const getSafesByOwner = async ({ address }) => safeClientServiceRef.current?.getSafesByOwner({ address })
  const getSafeInfo = async ({ address }) => safeClientServiceRef.current?.getSafeInfo({ address })
  const getTransactionInfo = async ({ safeTxHash }) => safeClientServiceRef.current?.getTransactionInfo({ safeTxHash })
  const confirmTransaction = async ({ safeTxHash, signature }: ISafeConfirmTransaction) =>
    safeClientServiceRef.current?.confirmTransaction({ safeTxHash, signature })

  const proposeTransaction = async (data: ProposeTransactionProps) =>
    safeClientServiceRef.current?.proposeTransaction(data)
  return {
    loadTempSafeClient,
    safeClient: safeClientServiceRef.current,
    reinitializeSafeService,
    getNextNonce,
    getBalances,
    getSafesByOwner,
    proposeTransaction,
    getSafeInfo,
    confirmTransaction,
    getTransactionInfo,
    getSafeCreationInfo,
    decodeData
  }
}
