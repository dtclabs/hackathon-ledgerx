import { useCallback, useState } from 'react'
import EthersService, { IBalanceMeta } from '@/services/ethers-service'


type IRPCType = 'ethereum' | 'goerli' | 'polygon' | 'bsc'

interface UseCheckBalance {
  balance: string | null
  isLoading: boolean
  error: Error | null
  getBalance: (walletAddress: string, contractAddress: string, rpcUrl: IRPCType, meta?: IBalanceMeta) => Promise<string>
}

export const useCheckBalance = (): UseCheckBalance => {
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  /* eslint-disable consistent-return */
  const getBalance = useCallback(
    async (walletAddress: string, contractAddress: string, rpcUrl: IRPCType, meta?: IBalanceMeta): Promise<string> => {
      setIsLoading(true)
      setError(null)
      setBalance(null)

      try {
        const ethersService = new EthersService(rpcUrl)
        const result = await ethersService.checkBalance(walletAddress, contractAddress, meta)
        return result
        setBalance(result)
      } catch (_error) {
        if (_error instanceof Error) {
          console.error('Error fetching balance:', _error)
          setError(_error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { balance, isLoading, error, getBalance }
}

export default useCheckBalance
