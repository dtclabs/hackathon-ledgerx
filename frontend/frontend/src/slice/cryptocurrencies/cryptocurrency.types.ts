export interface IRootCryptocurrencyState {
  allCryptoCurrencies: ICryptocurrency[]
  verifiedCryptoCurrencies: ICryptocurrency[]
  tokenPrices: any
  tokenFiatPriceMap: any
}

export interface ICryptocurrency {
  name: string
  publicId: string
  symbol: string
  image: {
    thumb: string
    small: string
    large: string
  }
  isVerified: boolean
  addresses: {
    blockchainId: string
    type: ICryptocurrencyType
    decimal: number
    address: string
  }[]
}

export interface IChainCryptocurrency {
  name: string
  publicId: string
  symbol: string
  image: string
  isVerified: boolean
  address: string
  blockchainId: string
  type: ICryptocurrencyType
  decimal: number
}

export enum ICryptocurrencyType {
  COIN = 'Coin',
  TOKEN = 'Token'
}
