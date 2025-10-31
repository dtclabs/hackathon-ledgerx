import { useCallback, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import EthersService from '@/services/ethers-service'

interface UseSetTokenApproval {
  transaction: ethers.ContractTransaction | null
  isLoading: boolean
  error: Error | null
  setApproval: (
    contractAddress: string,
    spenderAddress: string,
    amount: string | BigNumber,
    rpcUrl: string,
    signer: ethers.Signer
  ) => Promise<void>
}

export const useSetTokenApproval = (): UseSetTokenApproval => {
  const [transaction, setTransaction] = useState<ethers.ContractTransaction | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const setApproval = useCallback(
    async (
      contractAddress: string,
      spenderAddress: string,
      amount: string | BigNumber,
      rpcUrl: string,
      signer: ethers.Signer
    ): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const ethersService = new EthersService(rpcUrl)
        const transactionResponse = await ethersService.setTokenApproval(
          contractAddress,
          spenderAddress,
          amount,
          signer
        )
        setTransaction(transactionResponse)
      } catch (_error) {
        if (_error instanceof Error) {
          console.error('Error setting token approval:', _error)
          setError(_error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { transaction, isLoading, error, setApproval }
}

export default useSetTokenApproval
