import { INftCollection } from '@/api-v2/nft/nfts.type'
import NftFallback from '@/public/image/nft-fallback.png'
import _ from 'lodash'

export enum DetailType {
  NFT = 'nft',
  COLLECTION = 'collection'
}

export enum NFTTooltip {
  CURRENT_VALUE = 'Current Value is the average floor price of the NFT across our supported NFT marketplaces.',
  FLOOR_PRICE = 'Floor Price is the average price of all NFTs within this collection, calculated from the collective floor prices across our supported NFT marketplaces.'
}

const MARKET_PLACE_LINKS = {
  looksrare: 'https://looksrare.org/',
  blur: 'https://blur.io/',
  x2y2: 'https://x2y2.io/',
  opensea: 'https://opensea.io/',
  magiceden: 'https://magiceden.io/'
}

const CHAIN_MAP = {
  arbitrum_one: 'arbitrum',
  polygon: 'matic'
}

export const getMarketPlaceLink = (
  marketPlaceName: string,
  type: DetailType,
  contractAddress: string,
  blockchainId: string,
  tokenId?: string
): string => {
  let path = ''
  switch (marketPlaceName.toLowerCase()) {
    case 'looksrare':
      path =
        type === 'collection'
          ? `collections/${contractAddress.toLowerCase()}`
          : `collections/${contractAddress.toLowerCase()}/${tokenId}`
      break
    case 'blur':
      path =
        type === 'collection'
          ? `collection/${contractAddress.toLowerCase()}`
          : `asset/${contractAddress.toLowerCase()}/${tokenId}`
      break
    case 'opensea':
      path =
        type === 'collection'
          ? `assets/${CHAIN_MAP[blockchainId] || blockchainId}/${contractAddress.toLowerCase()}`
          : `assets/${CHAIN_MAP[blockchainId] || blockchainId}/${contractAddress.toLowerCase()}/${tokenId}`
      break
    case 'x2y2':
      path =
        type === 'collection'
          ? `collection/${contractAddress.toLowerCase()}`
          : `eth/${contractAddress.toLowerCase()}/${tokenId}`
      break
    default:
      path =
        type === 'collection'
          ? `assets/${CHAIN_MAP[blockchainId] || blockchainId}/${contractAddress.toLowerCase()}`
          : `assets/${CHAIN_MAP[blockchainId] || blockchainId}/${contractAddress.toLowerCase()}/${tokenId}`
  }

  return `${MARKET_PLACE_LINKS[marketPlaceName?.toLowerCase() || 'opensea']}${path}`
}

export const parseCollection = (_collection: INftCollection, supportedChains: any[]): INftCollection => {
  const validCostBasisData = _collection.nftSimplifiedList?.filter(
    (item) => item.costBasisAmount && item.costBasisFiatAmount
  )
  const validCurrentValueData = _collection.nftSimplifiedList?.filter(
    (item) => item.currentValueFiatAmount && item.currentValueCryptocurrencyAmount
  )
  const validGainLossData = _collection.nftSimplifiedList?.filter((item) => item.gainLoss)

  const totalCostBasis = validCostBasisData?.length
    ? validCostBasisData.reduce(
        (accumulator, currentValue) => ({
          totalCostBasisAmount: accumulator.totalCostBasisAmount + Number(currentValue.costBasisAmount) || 0,
          totalCostBasisFiatAmount: accumulator.totalCostBasisFiatAmount + Number(currentValue.costBasisFiatAmount) || 0
        }),
        { totalCostBasisAmount: 0, totalCostBasisFiatAmount: 0 }
      )
    : {
        totalCostBasisAmount: null,
        totalCostBasisFiatAmount: null
      }

  const totalCurrentValue = validCurrentValueData?.length
    ? validCurrentValueData.reduce(
        (accumulator, currentValue) => ({
          totalCurrentFiatAmount: accumulator.totalCurrentFiatAmount + Number(currentValue.currentValueFiatAmount) || 0,
          totalCurrentAmount:
            accumulator.totalCurrentAmount + Number(currentValue.currentValueCryptocurrencyAmount) || 0
        }),
        { totalCurrentFiatAmount: 0, totalCurrentAmount: 0 }
      )
    : {
        totalCurrentFiatAmount: null,
        totalCurrentAmount: null
      }
  const totalGainLoss = validGainLossData?.length
    ? validCurrentValueData.reduce((accumulator, currentValue) => accumulator + Number(currentValue.gainLoss) || 0, 0)
    : null

  const blockChains = _collection.nftSimplifiedList.map(
    (_nft) => supportedChains?.find((_blockChain) => _blockChain.id === _nft.blockchainId) || supportedChains[0]
  )

  return {
    ..._collection,
    ...totalCostBasis,
    ...totalCurrentValue,
    totalCostBasisAmount: totalCostBasis.totalCostBasisAmount?.toString() || null,
    totalCostBasisFiatAmount: totalCostBasis.totalCostBasisFiatAmount?.toString() || null,
    totalCurrentFiatAmount: totalCurrentValue.totalCurrentFiatAmount?.toString() || null,
    totalCurrentAmount: totalCurrentValue.totalCurrentAmount?.toString() || null,
    totalGainLoss: totalGainLoss?.toString() || null,
    blockChains: _.uniqBy(blockChains, (_blockChain) => _blockChain.chainId)
  }
}

const BLACKLIST_IMAGE_TYPE = 'svgxml'

export const getNftImage = (imageUrl: string) => {
  if (imageUrl && !imageUrl.toLowerCase().endsWith(BLACKLIST_IMAGE_TYPE)) return imageUrl
  return NftFallback
}
