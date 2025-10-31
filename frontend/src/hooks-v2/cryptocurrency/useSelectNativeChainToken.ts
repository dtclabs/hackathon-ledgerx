import { useAppSelector } from '@/state'
import { selectVerifiedCryptocurrencies } from '@/slice/cryptocurrencies/cryptocurrency-selector'


const useSelectedNativeChainToken = () => {
  const currencies = useAppSelector(selectVerifiedCryptocurrencies)

  const findNativeCoins = (_blockchainId) => {

    for (const currency of currencies) {
      if (currency.addresses.some((address) => address.blockchainId === _blockchainId && address.type === 'Coin')) {
        return {
          name: currency.name,
          symbol: currency.symbol,
          image: currency.image?.thumb
        }
      }
    }

    return { name: '', symbol: '', image: '' }
  }
  return { findNativeCoins }
}

export default useSelectedNativeChainToken
