import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import Decimal from 'decimal.js'
import { toChecksumAddress } from 'web3-utils'
import { CryptocurrencyResponseDto } from '../cryptocurrencies/interfaces'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import {
  NftCollectionContractAddress,
  NftCollectionFloorPrice,
  NftCollectionFloorPriceAggregate
} from '../shared/entity-services/nft-collections/interfaces'
import { NftCollection } from '../shared/entity-services/nft-collections/nft-collection.entity'
import { Nft } from '../shared/entity-services/nfts/nft.entity'

export class NftCollectionFloorPriceDto {
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

  static map(
    nftCollectionFloorPrice: NftCollectionFloorPrice,
    cryptocurrency: Cryptocurrency,
    cryptocurrencyCurrentPrice: Decimal
  ): NftCollectionFloorPriceDto {
    const dto = new NftCollectionFloorPriceDto()

    dto.marketplaceName = nftCollectionFloorPrice.marketplaceName
    dto.cryptocurrency = CryptocurrencyResponseDto.map(cryptocurrency)
    dto.cryptocurrencyAmount = nftCollectionFloorPrice.cryptocurrencyAmount
    dto.fiatCurrencyAmount = new Decimal(nftCollectionFloorPrice.cryptocurrencyAmount)
      .mul(cryptocurrencyCurrentPrice)
      .toString()

    return dto
  }
}
export class NftCollectionFloorPriceAggregateDto {
  @ApiProperty({ nullable: true, type: NftCollectionFloorPriceDto, isArray: true })
  @IsNotEmpty()
  floorPrices: NftCollectionFloorPriceDto[]

  @ApiProperty({ nullable: true, type: CryptocurrencyResponseDto })
  floorPriceAverageCryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  floorPriceAverageCryptocurrencyAmount: string

  @ApiProperty({ nullable: true, example: '100' })
  floorPriceAverageFiatAmount: string

  static map(
    nftCollectionFloorPriceAggregate: NftCollectionFloorPriceAggregate,
    cryptocurrencyMap: { [cryptocurrencyId: string]: Cryptocurrency },
    cryptocurrencyPriceMap: { [cryptocurrencyId: string]: Decimal }
  ): NftCollectionFloorPriceAggregateDto {
    const dto = new NftCollectionFloorPriceAggregateDto()

    if (nftCollectionFloorPriceAggregate?.floorPrices?.length) {
      dto.floorPrices = []
      for (const floorPrice of nftCollectionFloorPriceAggregate.floorPrices) {
        const nftCollectionFloorPrice = NftCollectionFloorPriceDto.map(
          floorPrice,
          cryptocurrencyMap[floorPrice.cryptocurrencyId],
          cryptocurrencyPriceMap[floorPrice.cryptocurrencyId]
        )

        dto.floorPrices.push(nftCollectionFloorPrice)
      }

      dto.floorPriceAverageCryptocurrency = nftCollectionFloorPriceAggregate.averageCryptocurrencyId
        ? CryptocurrencyResponseDto.map(cryptocurrencyMap[nftCollectionFloorPriceAggregate.averageCryptocurrencyId])
        : null

      dto.floorPriceAverageCryptocurrencyAmount = nftCollectionFloorPriceAggregate.averageCryptocurrencyAmount ?? null

      if (dto.floorPriceAverageCryptocurrencyAmount) {
        dto.floorPriceAverageFiatAmount = new Decimal(dto.floorPriceAverageCryptocurrencyAmount)
          .mul(cryptocurrencyPriceMap[nftCollectionFloorPriceAggregate.averageCryptocurrencyId])
          .toString()
      }
    }

    return dto
  }
}

export class NftCollectionNftSimplifiedDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Afterparty Utopian 11' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ nullable: true, type: ContactDto })
  @IsNotEmpty()
  ownerContact: ContactDto

  @ApiProperty()
  @IsNotEmpty()
  imageUrl: string

  @ApiProperty({ example: 'ethereum' })
  @IsNotEmpty()
  blockchainId: string

  @ApiProperty({ example: '2024-01-08T08:49:08Z' })
  @IsNotEmpty()
  acquiredAt: Date

  @ApiProperty({ nullable: true, type: CryptocurrencyResponseDto })
  costBasisCryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  costBasisAmount: string

  @ApiProperty({ nullable: true, example: 'USD' })
  fiatCurrency: string

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  costBasisFiatAmount: string

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  currentValueFiatAmount: string

  @ApiProperty({ nullable: true, type: CryptocurrencyResponseDto })
  currentValueCryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  currentValueCryptocurrencyAmount: string

  @ApiProperty({ nullable: true, example: '0.004473765531106052' })
  gainLoss: string

  static map(
    nft: Nft,
    contactDtoMap: { [address: string]: ContactDto },
    costBasisCryptocurrency?: Cryptocurrency,
    currentValueCryptocurrency?: Cryptocurrency
  ): NftCollectionNftSimplifiedDto {
    const dto = new NftCollectionNftSimplifiedDto()
    dto.id = nft.publicId
    dto.name = nft.name
    dto.ownerContact = contactDtoMap[nft.wallet.address]
    dto.imageUrl = nft.imageUrl
    dto.blockchainId = nft.blockchainId
    dto.acquiredAt = nft.acquiredAt

    dto.costBasisCryptocurrency = costBasisCryptocurrency
      ? CryptocurrencyResponseDto.map(costBasisCryptocurrency)
      : null
    if (nft.transactionMetadata?.costBasisCryptocurrencyId) {
      dto.costBasisAmount = nft.transactionMetadata.costBasisCryptocurrencyId
    }
    if (nft.transactionMetadata?.costBasisAmount) {
      dto.costBasisAmount = nft.transactionMetadata.costBasisAmount
    }

    if (nft.gainLossMetadata?.fiatCurrency) {
      dto.fiatCurrency = nft.gainLossMetadata.fiatCurrency
    }
    if (nft.gainLossMetadata?.costBasisFiatAmount) {
      dto.costBasisFiatAmount = nft.gainLossMetadata.costBasisFiatAmount
    }
    if (nft.gainLossMetadata?.currentValueFiatAmount) {
      dto.currentValueFiatAmount = nft.gainLossMetadata.currentValueFiatAmount
    }
    if (nft.gainLossMetadata?.currentValueCryptocurrencyId) {
      dto.currentValueCryptocurrency = currentValueCryptocurrency
        ? CryptocurrencyResponseDto.map(currentValueCryptocurrency)
        : null
    }
    if (nft.gainLossMetadata?.currentValueCryptocurrencyAmount) {
      dto.currentValueCryptocurrencyAmount = nft.gainLossMetadata.currentValueCryptocurrencyAmount
    }
    if (nft.gainLossMetadata?.gainLoss) {
      dto.gainLoss = nft.gainLossMetadata.gainLoss
    }

    return dto
  }
}

export class NftCollectionDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Azuki' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: '0x33c6Eec1723B12c46732f7AB41398DE45641Fa42' })
  @IsNotEmpty()
  contractAddresses: NftCollectionContractAddressDto[]

  @ApiProperty({
    example: 'A free collectible NFT proving you were in attendance for FreeNFT launch day. Welcome to the community!'
  })
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  imageUrl: string

  @ApiProperty()
  bannerImageUrl: string

  @ApiProperty()
  contractStandard: string

  @ApiProperty()
  @IsNotEmpty()
  nftSimplifiedList: NftCollectionNftSimplifiedDto[]

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  totalNft: number

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

  @ApiProperty({ nullable: true, type: NftCollectionFloorPriceAggregateDto })
  floorPriceAggregate: NftCollectionFloorPriceAggregateDto

  static map(params: {
    nftCollection: NftCollection
    nfts?: Nft[]
    fiatCurrency: string
    cryptocurrencyMap: { [cryptocurrencyId: string]: Cryptocurrency }
    cryptocurrencyPriceMap: { [cryptocurrencyId: string]: Decimal }
    contactDtoMap: { [address: string]: ContactDto }
  }): NftCollectionDto {
    const dto = new NftCollectionDto()
    dto.id = params.nftCollection.publicId
    dto.name = params.nftCollection.name
    dto.contractAddresses = params.nftCollection.contractAddresses.map((nftCollectionContractAddress) =>
      NftCollectionContractAddressDto.map(nftCollectionContractAddress)
    )

    dto.description = params.nftCollection.description
    dto.imageUrl = params.nftCollection.imageUrl
    dto.bannerImageUrl = params.nftCollection.bannerImageUrl
    dto.contractStandard = params.nftCollection.contractStandard

    let totalCostBasisDecimal = new Decimal(0)
    let totalCurrentValueDecimal = new Decimal(0)
    let totalGainLossDecimal = new Decimal(0)

    dto.nftSimplifiedList = []
    for (const nft of params.nfts ?? []) {
      const nftSimplified = NftCollectionNftSimplifiedDto.map(
        nft,
        params.contactDtoMap,
        params.cryptocurrencyMap[nft.transactionMetadata?.costBasisCryptocurrencyId],
        params.cryptocurrencyMap[nft.gainLossMetadata?.currentValueCryptocurrencyId]
      )
      dto.nftSimplifiedList.push(nftSimplified)

      totalCostBasisDecimal = totalCostBasisDecimal.add(nftSimplified.costBasisAmount ?? 0)
      totalCurrentValueDecimal = totalCurrentValueDecimal.add(nftSimplified.currentValueFiatAmount ?? 0)
      totalGainLossDecimal = totalGainLossDecimal.add(nftSimplified.gainLoss ?? 0)
    }
    dto.totalNft = params.nfts?.length || 0

    dto.fiatCurrency = params.fiatCurrency
    dto.floorPriceAggregate = NftCollectionFloorPriceAggregateDto.map(
      params.nftCollection.floorPriceAggregate,
      params.cryptocurrencyMap,
      params.cryptocurrencyPriceMap
    )

    return dto
  }
}

export class NftCollectionContractAddressDto {
  @ApiProperty({ example: 'ethereum' })
  @IsNotEmpty()
  blockchainId: string

  @ApiProperty({ example: '0x790b2cf29ed4f310bf7641f013c65d4560d28371' })
  @IsNotEmpty()
  contractAddress: string

  static map(nftCollectionContractAddress: NftCollectionContractAddress): NftCollectionContractAddressDto {
    const dto = new NftCollectionContractAddressDto()
    dto.blockchainId = nftCollectionContractAddress.blockchainId
    dto.contractAddress = toChecksumAddress(nftCollectionContractAddress.contractAddress)
    return dto
  }
}

export class NftCollectionDropdownDto {
  @ApiProperty({ example: '903e8832-f63d-456f-ab0a-ca6d53ec6a83' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Kaiju King' })
  @IsNotEmpty()
  name: string

  static map(nftCollection: NftCollection): NftCollectionDropdownDto {
    const dto = new NftCollectionDropdownDto()
    dto.id = nftCollection.publicId
    dto.name = nftCollection.name
    return dto
  }
}
