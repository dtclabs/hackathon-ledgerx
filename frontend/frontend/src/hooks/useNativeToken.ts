import { ListNativeToken } from '@/constants/chains'

export const useNativeToken = (chainId: number) => {
  const network = ListNativeToken.find((item) => item.chainId === chainId)
  return network?.name || 'ETH'
}

