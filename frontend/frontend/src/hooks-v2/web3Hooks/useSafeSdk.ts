import { useRef, useEffect } from 'react'
import { useAppSelector } from '@/state'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import {
  SafeSdk,
  ISafeCreateTransaction,
  IExecuteTransaction,
  ISignSafeTransaction,
  ISignSafeTransactionHash
} from '@/services/safe-sdk.service'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useWeb3React } from '@web3-react/core'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

interface IUseSafeSdkParams {
  rpcUrl: string
  safeAddress: string
}

export const useSafeSdk = () => {
  const { library } = useWeb3React()
  const safeSdkServiceRef = useRef<SafeSdk | null>(null)

  // Function to reinitialize Safe Service with new RPC URL or Safe address
  const reinitializeSafeService = async ({ rpcUrl: _rpcUrl, safeAddress: _safeAddress }: IUseSafeSdkParams) => {
    if (_rpcUrl && _safeAddress && library) {
      safeSdkServiceRef.current = new SafeSdk({ library })
      await safeSdkServiceRef.current.initialize({ safeAddress: _safeAddress })
    }
  }

  const createTransaction = async (_data: ISafeCreateTransaction) => {
    const transaction = await safeSdkServiceRef.current.createTransaction({
      transactionData: _data.transactionData,
      options: _data.options,
      onlyCalls: _data.onlyCalls
    })

    return transaction
  }

  const getTransactionHash = async (transaction: SafeTransaction) =>
    safeSdkServiceRef.current.getTransactionHash(transaction)

  const executeTransaction = async ({ safeTransaction, options }: IExecuteTransaction) =>
    safeSdkServiceRef.current.executeTransaction({ safeTransaction, options })

  const signTransaction = async ({ safeTransaction, signingMethod }: ISignSafeTransaction) =>
    safeSdkServiceRef.current.signTransaction({ safeTransaction, signingMethod })

  const signTransactionHash = async ({ hash }: ISignSafeTransactionHash) =>
    safeSdkServiceRef.current.signTransactionHash({ hash })

  return {
    safeSdk: safeSdkServiceRef.current,
    reinitializeSafeService,
    signTransactionHash,
    signTransaction,
    executeTransaction,
    createTransaction,
    getTransactionHash
  }
}
