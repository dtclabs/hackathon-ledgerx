import { IPrice } from '@/hooks/useUSDPrice'
import { log } from '@/utils-v2/logger'

export const getTokenUsdPrice = ({
  chainId,
  price,
  tokenAdd,
  tokens
}: {
  tokens: any[]
  price: IPrice
  tokenAdd: string
  chainId: number
}) => {
  if (!price) {
    log.error(
      "getTokenUsdPrice: price doesn't exist",
      ["getTokenUsdPrice: price doesn't exist"],
      { actualErrorObject: JSON.stringify({
        chainId,
        price,
        tokenAdd,
        tokens
      }) },
      `${window.location.pathname}`
    )
    return 1
  }

  if (!tokenAdd || tokenAdd === '') {
    if ([137, 80001].includes(chainId)) {
      return price['matic-network'].usd
    }
    if ([56].includes(chainId)) {
      return price.binancecoin.usd
    }
    if ([43114].includes(chainId)) {
      return price['avalanche-2'].usd
    }
    return price.ethereum.usd
  }
  const tokenData =
    tokens &&
    tokens.find((data) => tokenAdd && data.tokenAddress && data.tokenAddress.toLowerCase() === tokenAdd.toLowerCase())

  if (tokenData) {
    if (tokenData.name === 'XSGD') {
      return price.xsgd.usd
    }
    if (tokenData.name === 'XIDR') {
      return price['straitsx-indonesia-rupiah'].usd
    }
    if (tokenData.name === 'USDC') {
      return price['usd-coin'].usd
    }
    if (tokenData.name === 'USDT') {
      return price.tether.usd
    }
    if (tokenData.name === 'DAI') {
      return price.dai.usd
    }
    if (tokenData.name === 'BLUSGD') {
      return price['sgd-tracker'].usd
    }
    if (tokenData.name === 'MATIC') {
      return price['matic-network'].usd
    }
    if (tokenData.name === 'SIMP') {
      return price?.socol?.usd ?? 1
    }
    if (tokenData.name === 'SAND') {
      return price?.['the-sandbox']?.usd ?? 1
    }
    if (tokenData.name === 'MNT') {
      return price?.mantle?.usd ?? 1
    }
  }
  log.error(
    "getTokenUsdPrice: token data doesn't exist",
    ["getTokenUsdPrice: token data doesn't exis"],
    {
      actualErrorObject: tokenData
    },
    `${window.location.pathname}`
  )
  return 1
}