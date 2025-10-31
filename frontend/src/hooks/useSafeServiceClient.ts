import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/state'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { selectSafeUrlMap } from '@/slice/chains/chain-selectors'

const useSafeServiceClient = () => {
  const dispatch = useAppDispatch()
  const safeServiceUrl = useAppSelector(selectSafeUrlMap)
  const { library, chainId } = useWeb3React()
  const selectedChain = useAppSelector(selectedChainSelector)

  const [safeService, setSafeService] = useState<SafeServiceClient | null>(null)
  useEffect(() => {
    try {
      if (library) {
        const safeOwner = library.getSigner()

        const ethAdapter = new EthersAdapter({
          ethers,
          signer: safeOwner
        })

        const transactionServiceUrl =
          (chainId && safeServiceUrl[selectedChain?.id]) || 'https://safe-transaction.gnosis.io'

        setSafeService(
          new SafeServiceClient({
            txServiceUrl: transactionServiceUrl,
            ethAdapter
          })
        )
      } else {
        setSafeService(null)
      }
    } catch (err: any) {
      sentryCaptureException(err.message)
      // dispatch(err.message)
    }
  }, [chainId, dispatch, library, selectedChain])

  return safeService
}

export default useSafeServiceClient
