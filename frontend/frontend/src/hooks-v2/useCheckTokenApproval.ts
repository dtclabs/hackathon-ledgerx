import { useCallback, useState } from 'react'
import EthersService from '@/services/ethers-service'

interface UseCheckTokenApproval {
  allowance: string | null
  isLoading: boolean
  error: Error | null
  checkAllowance: (
    walletAddress: string,
    spenderAddress: string,
    rpcUrl: string
  ) => Promise<void>
}

export const useCheckTokenApproval = (): UseCheckTokenApproval => {
  const [allowance, setAllowance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const checkAllowance = useCallback(
    async (walletAddress: string, spenderAddress: string, rpcUrl: string): Promise<void> => {
      setIsLoading(true)
      setError(null)
      setAllowance(null)
   
      try {
        const ethersService = new EthersService(rpcUrl)
        const result = await ethersService.checkTokenAllowance(walletAddress, spenderAddress)
        setAllowance(result)
      } catch (_error) {
        if (_error instanceof Error) {
          console.error('Error checking token allowance:', _error)
          setError(_error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { allowance, isLoading, error, checkAllowance }
}

export default useCheckTokenApproval
