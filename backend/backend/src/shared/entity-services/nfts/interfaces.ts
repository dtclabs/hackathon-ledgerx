export interface NftPrice {
  currencyAddress: string
  currencyName: string
  amount: string
  blockchainId: string
  amountTokenToFiat: string
}

export interface NftTrait {
  key: string
  value: string
  percentage: string
}

export interface NftTransactionMetadata {
  hash?: string
  costBasisCryptocurrencyId: string
  costBasisAmount: string
  valueAt: Date
  // type: string
}

export interface NftGainLossMetadata {
  fiatCurrency: string
  costBasisFiatAmount: string
  currentValueFiatAmount?: string
  currentValueCryptocurrencyId?: string
  currentValueCryptocurrencyAmount?: string
  gainLoss?: string
  floorPrices?: NftFloorPrice[]
}

export interface NftFloorPrice {
  marketplaceId: string
  marketplaceName: string
  cryptocurrencyId: string
  cryptocurrencyAmount: string
  fiatAmount: string
}
