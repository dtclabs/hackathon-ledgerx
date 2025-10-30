import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { CryptocurrencyAddress } from '../shared/entity-services/cryptocurrencies/cryptocurrency-address.entity'
import { Cryptocurrency, CryptocurrencyImage } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { CryptocurrencyType } from '../shared/entity-services/cryptocurrencies/interfaces'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { addressHelper } from '../shared/helpers/address.helper'

export class CryptocurrencyResponseDto {
  @ApiProperty({ example: 'USD Coin' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: '0ef47d42-10bf-4404-88f4-f7a7f57fa923' })
  @IsNotEmpty()
  publicId: string

  @ApiProperty({ example: 'USDC' })
  @IsNotEmpty()
  symbol: string

  @ApiProperty({
    example: {
      thumb: 'https://assets.coingecko.com/coins/images/6319/thumb/usdc.png',
      small: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      large: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png'
    }
  })
  @IsNotEmpty()
  image: CryptocurrencyImage

  @ApiProperty({ isArray: true, type: () => CryptocurrencyAddressResponseDto })
  @IsNotEmpty()
  addresses: CryptocurrencyAddressResponseDto[]

  @ApiProperty({ example: true })
  @IsNotEmpty()
  isVerified: boolean

  static map(cryptocurrency: Cryptocurrency): CryptocurrencyResponseDto {
    const result = new CryptocurrencyResponseDto()
    result.name = cryptocurrency.name
    result.publicId = cryptocurrency.publicId
    result.symbol = cryptocurrency.symbol
    
    // Convert private S3 URLs to public CoinGecko URLs
    result.image = CryptocurrencyResponseDto.getPublicImageUrls(cryptocurrency.symbol, cryptocurrency.image)
    
    result.isVerified = cryptocurrency.isVerified
    if (cryptocurrency.addresses) {
      result.addresses = cryptocurrency.addresses.map((address) => CryptocurrencyAddressResponseDto.map(address))
    }
    return result
  }

  /**
   * Convert private S3 image URLs to public CoinGecko URLs
   */
  private static getPublicImageUrls(symbol: string, originalImage?: CryptocurrencyImage): CryptocurrencyImage {
    // Map symbols to CoinGecko image IDs
    const coinGeckoImageMap: { [key: string]: string } = {
      'USDC': '6319', // USD Coin
      'SOL': '4128',  // Solana
      'BONK': '28600', // Bonk
      'JUP': '18876',  // Jupiter
      'ETH': '279',    // Ethereum
      'BTC': '1',      // Bitcoin
      'USDT': '325',   // Tether
      'BNB': '825',    // Binance Coin
      'ADA': '975',    // Cardano
      'DOT': '12171',  // Polkadot
      'MATIC': '4713', // Polygon
      'AVAX': '12559', // Avalanche
      'LINK': '1975',  // Chainlink
      'UNI': '12504',  // Uniswap
      'LTC': '2',      // Litecoin
      'XRP': '44',     // Ripple
      'DOGE': '5470',  // Dogecoin
      'SHIB': '11939', // Shiba Inu
      'TRX': '1958',   // TRON
      'ATOM': '3794'   // Cosmos
    }

    const imageId = coinGeckoImageMap[symbol.toUpperCase()]
    
    if (imageId) {
      return {
        large: `https://assets.coingecko.com/coins/images/${imageId}/large/${symbol.toLowerCase()}.png`,
        small: `https://assets.coingecko.com/coins/images/${imageId}/small/${symbol.toLowerCase()}.png`,
        thumb: `https://assets.coingecko.com/coins/images/${imageId}/thumb/${symbol.toLowerCase()}.png`
      }
    }

    // Fallback to original image or empty URLs
    return originalImage ?? {
      large: '',
      small: '',
      thumb: ''
    }
  }
}

export class CryptocurrencyAddressResponseDto {
  @ApiProperty({ example: 1 })
  blockchainId: string

  @ApiProperty({ example: CryptocurrencyType.TOKEN, enum: CryptocurrencyType })
  type: CryptocurrencyType

  @ApiProperty({
    example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  })
  @IsOptional()
  address: string

  @ApiProperty({ example: 6 })
  @IsNotEmpty()
  decimal: number

  static map(cryptocurrencyAddress: CryptocurrencyAddress): CryptocurrencyAddressResponseDto {
    const result = new CryptocurrencyAddressResponseDto()
    result.blockchainId = cryptocurrencyAddress.blockchainId
    result.type = cryptocurrencyAddress.type
    result.decimal = cryptocurrencyAddress.decimal
    result.address = addressHelper.formatAddressForBlockchain(
      cryptocurrencyAddress.address, 
      cryptocurrencyAddress.blockchainId
    )
    return result
  }
}

export class CryptocurrenciesByWalletIdsQueryParams {
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsString({ each: true })
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainIds?: string[]

  @IsOptional()
  @ToArray()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({ isArray: true, example: ['e24d4f28-e741-41e7-a4fb-3b295d925353'] })
  walletIds?: string[]
}

export class AllSolanaTokensQueryParams {
  @IsOptional()
  @ToArray()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['solana', 'solana-devnet'],
    description: 'Solana blockchain IDs to filter tokens. If not provided, returns tokens from all Solana networks.'
  })
  blockchainIds?: string[]
}
