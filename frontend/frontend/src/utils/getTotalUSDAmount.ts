export const getTotalUSDAmount = (chainId: number, amount: string, price: any, token?: any) => {
  if (price) {
    if (token) {
      if (token.name === 'XSGD') {
        return String((Number(amount) * price['sgd-tracker'].usd).toFixed(6))
      }
      if (token.name === 'BLUSGD') {
        return String((Number(amount) * price.xsgd.usd).toFixed(6))
      }
      if (token.name === 'XIDR') {
        return String((Number(amount) * price['straitsx-indonesia-rupiah'].usd).toFixed(6))
      }
      if (token.name === 'USDC') {
        return String((Number(amount) * price['usd-coin'].usd).toFixed(6))
      }
      if (token.name === 'USDT') {
        return String((Number(amount) * price.tether.usd).toFixed(6))
      }
      if (token.name === 'DAI') {
        return String((Number(amount) * price.dai.usd).toFixed(6))
      }
      if (token.name === 'MATIC') {
        return String((Number(amount) * price['matic-network'].usd).toFixed(6))
      }
    }

    if ([137, 80001].includes(chainId)) {
      return String((Number(amount) * price['matic-network'].usd).toFixed(6))
    }
    if ([43114].includes(chainId)) {
      return String((Number(amount) * price['avalanche-2'].usd).toFixed(6))
    }
    if ([56].includes(chainId)) {
      return String((Number(amount) * price.binancecoin.usd).toFixed(6))
    }
    return String((Number(amount) * price.ethereum.usd).toFixed(6))
  }
  return Number(amount).toFixed(6)
}
