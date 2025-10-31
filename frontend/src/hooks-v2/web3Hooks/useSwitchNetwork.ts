import { useEffect, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import EthersServiceV2, { ISwitchNetwork } from '@/services/ether-service-v2'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useAppSelector } from '@/state'

export const useSwitchNetwork = () => {
  const { library, active } = useWeb3React()
  const ethersService = useRef<EthersServiceV2 | null>(null)
  const chainDetails = useAppSelector(supportedChainsSelector)

  useEffect(() => {
    if (active && library) {
      try {
        const service = new EthersServiceV2(library.provider)
        ethersService.current = service
      } catch (err) {
        throw new Error('Issue with setting EthersService')
      }
    } else {
      throw new Error('No Active Provider or Library')
    }
  }, [library, active])

  const switchNetwork = async (_args: ISwitchNetwork) => {
    const chainMeta = chainDetails.find((chain) => chain.chainId === _args.chainId)

    if (ethersService.current) {
      return ethersService.current.switchNetwork({
        chainName: _args.chainName,
        chainId: _args.chainId,
        rpcUrls: _args.rpcUrls,
        nativeCurrency: {
          // Default to 18 decimals when metadata missing
          decimals: 18,
          symbol: chainMeta?.name || 'ETH'
        }
      })
    }
    return null
  }

  return { switchNetwork }
}

export default useSwitchNetwork
