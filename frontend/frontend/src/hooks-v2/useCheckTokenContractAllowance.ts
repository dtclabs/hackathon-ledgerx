import { useCallback, useState } from 'react'
import EthersService, { IBalanceMeta } from '@/services/ethers-service'

interface UseCheckTokenApproval {
  allowance: string | null
  isLoading: boolean
  error: Error | null
  checkContractTokenAllowance: (
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    meta: IBalanceMeta,
    rpcUrl: string
  ) => Promise<void>
}

export const useCheckTokenContractAllowance = (): UseCheckTokenApproval => {
  const [allowance, setAllowance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const checkContractTokenAllowance = useCallback(
    async (
      tokenAddress: string,
      ownerAddress: string,
      spenderAddress: string,
      meta: IBalanceMeta,
      rpcUrl: string
    ): Promise<void> => {
      setIsLoading(true)
      setError(null)
      setAllowance(null)

      try {
        const ethersService = new EthersService(rpcUrl)
        const result = await ethersService.checkContractTokenAllowance(tokenAddress, ownerAddress, spenderAddress, meta)
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

  return { allowance, isLoading, error, checkContractTokenAllowance }
}

export default useCheckTokenContractAllowance
