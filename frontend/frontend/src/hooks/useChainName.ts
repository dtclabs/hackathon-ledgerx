import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { CHAIN_NAME } from '@/constants/chains'

export const useChainName = () => {
  const { chainId } = useWeb3React()
  const [name, setName] = useState('')

  useEffect(() => {
    if (chainId) {
      const chain = CHAIN_NAME.find((item) => item.chainId === chainId)
      setName(chain ? chain.name : '')
    }
  }, [chainId])

  return name
}
