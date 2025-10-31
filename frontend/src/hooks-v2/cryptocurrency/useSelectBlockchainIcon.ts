import { useAppSelector } from '@/state'
import { selectChainIcons } from '@/slice/chains/chain-selectors'

const useSelectBlockchainIcon = () => {
  const chainIcons: any = useAppSelector(selectChainIcons)

  const findBlockchainIcon = (_blockchainId) => {
    if (chainIcons[_blockchainId]) {
      return chainIcons[_blockchainId]
    }
    return chainIcons?.ethereum
  }
  return { findBlockchainIcon }
}

export default useSelectBlockchainIcon
