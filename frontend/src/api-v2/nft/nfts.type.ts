export enum NftSyncStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

interface IGetParams {
  search?: string
  page?: number | string
  size?: number | string
  direction?: string
  order?: string
}

interface IOwnerContact {
  organizationId: string
  name: string
  type: string
  typeId: string
  addresses: any[]
}

interface ICryptocurrency {
  name: string
  publicId: string
  symbol: string
  image: {
    thumb?: string
    small?: string
    large?: string
  }
  addresses: any[]
  isVerified: boolean
}

export interface IGetNftsParams {
  organizationId: string
  params?: IGetParams & {
    walletIds?: string[]
    collectionIds?: string[]
    blockchainIds?: string[]
  }
}

export interface INftTrait {
  key: string
  value: string
  percentage: string
}

export interface ICollectionSimplified {
  id: string
  name: string
}

export interface INft {
  id: string
  name: string
  tokenId: string
  ownerContact: IOwnerContact
  imageUrl: string
  blockchainId: string
  acquiredAt: Date
  costBasisCryptocurrency: ICryptocurrency
  costBasisAmount: string
  fiatCurrency: string
  costBasisFiatAmount: string
  currentValueFiatAmount: string
  currentValueCryptocurrency: ICryptocurrency
  currentValueCryptocurrencyAmount: string
  gainLoss: string
  floorPrices: INftCollectionFloorPrice[]
  collectionSimplified: ICollectionSimplified
  wallet: any
  traits: INftTrait[]
  rarityRank: string
}

export interface INftCollectionFloorPrice {
  marketplaceName: string
  cryptocurrency: ICryptocurrency
  cryptocurrencyAmount: string
  fiatCurrencyAmount: string
}

export interface INftsSimplified {
  id: string
  name: string
  imageUrl: string
  acquiredAt: Date
  ownerContact: IOwnerContact
  blockchainId: string
  costBasisCryptocurrency: ICryptocurrency
  costBasisAmount: string
  fiatCurrency: string
  costBasisFiatAmount: string
  currentValueFiatAmount: string
  currentValueCryptocurrency: ICryptocurrency
  currentValueCryptocurrencyAmount: string
  gainLoss: string
}

interface INftCollectionFloorPriceAggregate {
  floorPrices: INftCollectionFloorPrice[]
  floorPriceAverageCryptocurrency: ICryptocurrency
  floorPriceAverageCryptocurrencyAmount: string
  floorPriceAverageFiatAmount: string
}
export interface INftCollection {
  id: string
  name: string
  contractAddresses: {
    blockchainId: string
    contractAddress: string
  }[]
  description: string
  imageUrl: string
  bannerImageUrl: string
  contractStandard: string
  nftSimplifiedList: INftsSimplified[]
  totalNft: number
  totalCurrentValue: string
  totalCostBasis: string
  totalGainLoss: string
  fiatCurrency: string
  floorPriceAggregate: INftCollectionFloorPriceAggregate
  totalCostBasisAmount?: string
  totalCostBasisFiatAmount?: string
  totalCurrentFiatAmount?: string
  totalCurrentAmount?: string
  blockChains?: any[]
}

export interface INftAggregate {
  totalNfts: number
  totalCostBasis: string
  totalCurrentValue: string
  totalGainLoss: string
  fiatCurrency: string
}

export interface INftSync {
  status: NftSyncStatus
  createdAt: Date
  updatedAt: Date
}

export interface INftWaitList{
  organizationId: string,
  payload: {
    contactEmail: string
    featureName: string
  }
}
