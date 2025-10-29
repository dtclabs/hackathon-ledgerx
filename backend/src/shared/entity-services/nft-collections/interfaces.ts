export class NftCollectionContractAddress {
  blockchainId: string
  contractAddress: string
}

export enum NftCollectionContractStandard {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155'
}

export interface NftCollectionFloorPrice {
  marketplaceId: string
  marketplaceName: string
  cryptocurrencyId: string
  cryptocurrencyAmount: string
}
export interface NftCollectionFloorPriceAggregate {
  // Hardcoded to ethereum for now. Once we go multichain, need to expand to coin of more chains
  averageCryptocurrencyId?: string
  averageCryptocurrencyAmount?: string
  floorPrices: NftCollectionFloorPrice[]
}
