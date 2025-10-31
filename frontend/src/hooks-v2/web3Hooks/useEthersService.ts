import { useAppSelector } from '@/state'
import { useEffect, useRef, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import EthersServiceV2 from '@/services/ether-service-v2'
import { GenericError } from '@/shared/error-types'
import { selectChainByIdMap } from '@/slice/chains/chain-selectors'
import { selectChainsNativeToken } from '@/slice/cryptocurrencies/cryptocurrency-selector'

export const useEthersService = () => {
  const { library, active } = useWeb3React()
  const [error, setError] = useState<string | null>('')
  const ethersService = useRef<EthersServiceV2 | null>(null)
  const chainIdMap = useAppSelector(selectChainByIdMap)
  const chainNativeTokens = useAppSelector(selectChainsNativeToken)

  useEffect(() => {
    if (active && library) {
      try {
        console.log('Initializing EthersServiceV2')
        const service = new EthersServiceV2(library.provider)
        ethersService.current = service
      } catch (err) {
        throw new GenericError('Sorry there was no active provider', 'Error initiating EthersService')
      }
    }
  }, [library, active])

  const getTransaction = async ({ transactionHash }) => {
    try {
      const result = await ethersService.current.getTransaction({ transactionHash })

      return result
    } catch (_err) {
      throw new Error('Error checking wallet type', _err)
    }
  }

  const isEoaWallet = async ({ address }) => {
    try {
      const result = await ethersService.current.isEoaWallet({ address })

      return result
    } catch (_err) {
      throw new Error('Error checking wallet type', _err)
    }
  }

  const switchNetwork = async ({ chainId }): Promise<boolean> => {
    try {
      const targetNetwork = chainIdMap[chainId]
      const nativeToken = chainNativeTokens[targetNetwork?.id]
      const result = await ethersService.current.switchNetwork({
        chainId: targetNetwork.chainId,
        chainName: targetNetwork.name,
        nativeCurrency: {
          decimals: nativeToken?.decimal,
          symbol: nativeToken?.symbol
        },
        // `apiUrl` is the RPC endpoint in our chain metadata
        rpcUrls: [targetNetwork.apiUrl]
      })

      return true
    } catch (_err: any) {
      setError(_err.message)
      return false
    }
  }

  return { getTransaction, switchNetwork, isEoaWallet }
}

export default useEthersService
