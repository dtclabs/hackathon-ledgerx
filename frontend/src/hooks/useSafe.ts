import { useCallback, useState } from 'react'
import Safe, { SafeAccountConfig, SafeFactory, ContractNetworksConfig } from '@gnosis.pm/safe-core-sdk'
import { SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { GNOSIS_SAFE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'

const useSafe = () => {
  const { library, chainId } = useWeb3React()
  const [safe, setSafe] = useState<Safe>(undefined)
  const [error, setError] = useState<any>()
  const deploySafe = useCallback(
    async (
      safeAccountConfig: SafeAccountConfig,
      setStatus?: (title: string) => void,
      setDescription?: (description: string) => void
    ) => {
      if (library) {
        const safeOwner = library.getSigner()
        setStatus('Waiting Sign')
        setDescription('Please confirm the Safe creation in your wallet')
        const ethAdapter = new EthersAdapter({
          ethers,
          signer: safeOwner
        })
        try {
          const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter as any })
          setStatus('Transaction is in progress')
          setDescription('Please do not leave page!')
          const newSafe = await safeFactory.deploySafe({ safeAccountConfig })
          return newSafe
        } catch (err: any) {
          sentryCaptureException(err.message)
          setStatus('Error')
          setDescription(err.message && (err.message as string))
          return null
        }
      }
      return null
    },
    [library]
  )

  const loadSafe = useCallback(
    async (safeAddress: string) => {
      try {
        if (library) {
          console.log('HAS LIBRARY')
          try {
            const safeOwner = library.getSigner()
            console.log('SAFE OWNER: ', safeOwner)
            const ethAdapter = new EthersAdapter({
              ethers,
              signer: safeOwner
            })
            console.log('ETH ADAPTER: ', ethAdapter)
            console.log('SAFE ADDRESS: ', safeAddress)
            console.log('GNOSIS SAFE CONTRACT MAP', GNOSIS_SAFE_CONTRACT_MAP)
            const newSafe = await Safe.create({
              ethAdapter,
              safeAddress,
              contractNetworks: GNOSIS_SAFE_CONTRACT_MAP
            })

            console.log('NEW SAFE', newSafe)
            setSafe(newSafe)
            return newSafe
          } catch (_err) {
            setError(_err)
            sentryCaptureException(_err)
          }
        }

        return null
      } catch (err) {
        console.log('LOAD  SAFE ERROR: ', err)
        setError(err)
        sentryCaptureException(err)
        return null
      }
    },
    [library, chainId]
  )

  const createTransaction = useCallback(
    async (transaction: SafeTransactionDataPartial) => {
      if (safe) {
        const safeTransaction = await safe.createTransaction({ safeTransactionData: transaction })
      }
    },
    [safe]
  )

  return { deploySafe, loadSafe, createTransaction, safe, safeError: error }
}

export default useSafe
