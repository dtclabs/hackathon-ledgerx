import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { PaginationParams } from '../core/interfaces'
import { CryptocurrencyResponseDto } from '../cryptocurrencies/interfaces'
import { NftCollectionFloorPriceDto } from '../nft-collections/interfaces'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { NftCollection } from '../shared/entity-services/nft-collections/nft-collection.entity'
import { NftFloorPrice, NftTrait } from '../shared/entity-services/nfts/interfaces'
import { Nft } from '../shared/entity-services/nfts/nft.entity'
import { WalletDto } from '../wallets/interfaces'

interface NftFilter {
  collectionIds: string[]
  walletIds: string[]
  blockchainIds: string[]
  search: string
}

export class NftQueryParams extends PaginationParams implements NftFilter {
  @IsOptional()
  @IsUUID('all', { each: true })
  @ToArray()
  @ApiProperty({
    description: 'Array of wallet ids in organization',
    required: false
  })
  walletIds: string[]

  @IsOptional()
  @IsUUID('all', { each: true })
  @ToArray()
  @ApiProperty({
    description: 'Array of collection ids',
    required: false
  })
  collectionIds: string[]

  @IsOptional()
  @IsString({ each: true })
  @ToArray()
  @ApiProperty({
    description: 'Array of blockchain ids',
    required: false
  })
  blockchainIds: string[]

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search for nft name, collection, tokenId',
    required: false
  })
  search: string
}

export class NftCollectionSimplifiedDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Afterparty Utopians' })
  @IsNotEmpty()
  name: string

  static map(nftCollection: NftCollection): NftCollectionSimplifiedDto {
    const dto = new NftCollectionSimplifiedDto()

    dto.id = nftCollection.publicId
    dto.name = nftCollection.name

    return dto
  }
}

export class NftTraitDto {
  @ApiProperty({ example: 'Hair' })
  @IsNotEmpty()
  key: string

  @ApiProperty({ example: 'Bald' })
  @IsNotEmpty()
  value: string

  @ApiProperty({ example: '20.4' })
  @IsNotEmpty()
  percentage: string

  static map(nftTrait: NftTrait): NftTraitDto {
    const dto = new NftTraitDto()

    dto.key = nftTrait.key
    dto.value = nftTrait.value
    dto.percentage = nftTrait.percentage

    return dto
  }
}

export class NftFloorPriceDto {
  @ApiProperty({ example: 'OpenSea' })
  @IsNotEmpty()
  marketplaceName: string

  @ApiProperty({ type: Cryptocurrency })
  @IsNotEmpty()
  cryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ example: '0.123' })
  @IsNotEmpty()
  cryptocurrencyAmount: string

  @ApiProperty({ example: '1000' })
  @IsNotEmpty()
  fiatCurrencyAmount: string

  static map(nftFloorPrice: NftFloorPrice, cryptocurrency: Cryptocurrency): NftCollectionFloorPriceDto {
    const dto = new NftCollectionFloorPriceDto()

    dto.marketplaceName = nftFloorPrice.marketplaceName
    dto.cryptocurrency = CryptocurrencyResponseDto.map(cryptocurrency)
    dto.cryptocurrencyAmount = nftFloorPrice.cryptocurrencyAmount
    dto.fiatCurrencyAmount = nftFloorPrice.fiatAmount

    return dto
  }
}

export class NftDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Mint Machine' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: '432' })
  @IsNotEmpty()
  tokenId: string

  @ApiProperty({ nullable: true, type: ContactDto })
  @IsNotEmpty()
  ownerContact: ContactDto

  @ApiProperty()
  @IsNotEmpty()
  imageUrl: string

  @ApiProperty({ example: 'ethereum' })
  blockchainId: string

  @ApiProperty({ example: '2023-09-21T06:53:11.000Z' })
  acquiredAt: Date

  @ApiProperty({ nullable: false, type: CryptocurrencyResponseDto })
  costBasisCryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ nullable: false, example: '0.004473765531106052' })
  costBasisAmount: string

  @ApiProperty({ nullable: false, example: 'USD' })
  fiatCurrency: string

  @ApiProperty({ nullable: false, example: '0.004473765531106052' })
  costBasisFiatAmount: string

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  currentValueFiatAmount: string

  @ApiProperty({ nullable: true, type: CryptocurrencyResponseDto })
  currentValueCryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  currentValueCryptocurrencyAmount: string

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  gainLoss: string

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  floorPrices: NftCollectionFloorPriceDto[]

  @ApiProperty({ type: NftCollectionSimplifiedDto })
  @IsNotEmpty()
  collectionSimplified: NftCollectionSimplifiedDto

  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  wallet: WalletDto

  @ApiProperty({ nullable: true })
  traits: NftTrait[]

  @ApiProperty({ example: '432', nullable: true })
  rarityRank: string

  static map(params: {
    nft: Nft
    costBasisCryptocurrency?: Cryptocurrency
    contact?: ContactDto
    currentValueCryptocurrency?: Cryptocurrency
    floorPriceCryptocurrency?: Cryptocurrency
  }): NftDto {
    const dto = new NftDto()
    dto.id = params.nft.publicId
    dto.name = params.nft.name
    dto.tokenId = params.nft.tokenId
    dto.ownerContact = params.contact ?? null
    dto.imageUrl = params.nft.imageUrl
    dto.blockchainId = params.nft.blockchainId
    dto.acquiredAt = params.nft.acquiredAt

    dto.costBasisCryptocurrency = params.costBasisCryptocurrency
      ? CryptocurrencyResponseDto.map(params.costBasisCryptocurrency)
      : null
    if (params.nft.transactionMetadata?.costBasisCryptocurrencyId) {
      dto.costBasisAmount = params.nft.transactionMetadata.costBasisCryptocurrencyId
    }
    if (params.nft.transactionMetadata?.costBasisAmount) {
      dto.costBasisAmount = params.nft.transactionMetadata.costBasisAmount
    }

    if (params.nft.gainLossMetadata?.fiatCurrency) {
      dto.fiatCurrency = params.nft.gainLossMetadata.fiatCurrency
    }
    if (params.nft.gainLossMetadata?.costBasisFiatAmount) {
      dto.costBasisFiatAmount = params.nft.gainLossMetadata.costBasisFiatAmount
    }
    if (params.nft.gainLossMetadata?.currentValueFiatAmount) {
      dto.currentValueFiatAmount = params.nft.gainLossMetadata.currentValueFiatAmount
    }
    if (params.nft.gainLossMetadata?.currentValueCryptocurrencyId) {
      dto.currentValueCryptocurrency = params.currentValueCryptocurrency
        ? CryptocurrencyResponseDto.map(params.currentValueCryptocurrency)
        : null
    }
    if (params.nft.gainLossMetadata?.currentValueCryptocurrencyAmount) {
      dto.currentValueCryptocurrencyAmount = params.nft.gainLossMetadata.currentValueCryptocurrencyAmount
    }
    if (params.nft.gainLossMetadata?.gainLoss) {
      dto.gainLoss = params.nft.gainLossMetadata.gainLoss
    }

    dto.collectionSimplified = NftCollectionSimplifiedDto.map(params.nft.nftCollection)
    if (params.nft.traits) {
      dto.traits = []
      for (const trait of params.nft.traits) {
        dto.traits.push(NftTraitDto.map(trait))
      }
    }
    dto.rarityRank = params.nft.rarityRank
    if (params.nft.gainLossMetadata?.floorPrices?.length) {
      dto.floorPrices = []
      for (const floorPrice of params.nft.gainLossMetadata?.floorPrices) {
        dto.floorPrices.push(NftFloorPriceDto.map(floorPrice, params.floorPriceCryptocurrency))
      }
    }

    return dto
  }
}

export class NftAggregateQueryParams implements NftFilter {
  @IsOptional()
  @IsUUID('all', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiProperty({
    description: 'Array of wallet ids in organization',
    required: false
  })
  walletIds: string[]

  @IsOptional()
  @IsUUID('all', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiProperty({
    description: 'Array of collection ids',
    required: false
  })
  collectionIds: string[]

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiProperty({
    description: 'Array of blockchain ids',
    required: false
  })
  blockchainIds: string[]

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search for nft name, collection, tokenId',
    required: false
  })
  search: string
}

export class NftAggregateDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  totalNfts: number

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  totalCostBasis: string

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  totalCurrentValue: string

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  totalGainLoss: string

  @ApiProperty({ example: 'USD' })
  fiatCurrency: string

  static map(params: {
    totalNfts: number
    totalCostBasis: string
    totalCurrentValue: string
    totalGainLoss: string
    fiatCurrency: string
  }): NftAggregateDto {
    const dto = new NftAggregateDto()
    dto.totalNfts = params.totalNfts || 0
    dto.totalCostBasis = params.totalCostBasis || '0'
    dto.totalCurrentValue = params.totalCurrentValue || '0'
    dto.totalGainLoss = params.totalGainLoss || '0'
    dto.fiatCurrency = params.fiatCurrency

    return dto
  }
}
