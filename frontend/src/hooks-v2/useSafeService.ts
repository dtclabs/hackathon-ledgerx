import { useRef, useEffect } from 'react'
import { ExtendedSafeService } from '@/services/safe-service'

interface IUseSafeServiceParams {
  initialRpcUrl: string
  initialSafeUrl: string
}

export const useSafeService = ({ initialRpcUrl, initialSafeUrl }: IUseSafeServiceParams) => {
  const safeServiceRef = useRef<ExtendedSafeService | null>(null)

  // Re-initialize when URLs change
  useEffect(() => {
    if (initialRpcUrl && initialSafeUrl) {
      safeServiceRef.current = new ExtendedSafeService(initialRpcUrl, initialSafeUrl)
      // safeServiceRef.current.updateUrls(initialRpcUrl, initialSafeUrl)
    }
  }, [initialRpcUrl, initialSafeUrl])

  const updateUrls = (newRpcUrl, newSafeUrl) => {
    safeServiceRef.current.updateUrls(newRpcUrl, newSafeUrl)
  }

  const getSafesByOwner = async ({ address }) => safeServiceRef.current.getSafesByOwner({ address })

  const getSafeInfo = async ({ address }) => safeServiceRef.current.getSafeInfo({ address })

  const getTransactionInfo = async ({ safeTxHash }) => safeServiceRef.current.getTransactionInfo({ safeTxHash })

  const confirmTransaction = async ({ safeTxHash, signature }) =>
    safeServiceRef.current.confirmTransaction({ safeTxHash, signature })

  return {
    safeService: safeServiceRef.current,
    updateUrls,
    getSafesByOwner,
    getSafeInfo,
    confirmTransaction,
    getTransactionInfo
  }
}

export default useSafeService
