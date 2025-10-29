import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { toChecksumAddress } from 'web3-utils'
import { ToArray, ToBoolean } from '../shared/decorators/transformers/transformers'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { IsEthereumOrSolanaAddress } from '../shared/validators/address.validator'
import { WalletGroup } from '../shared/entity-services/wallet-groups/wallet-group.entity'
import { SourceType, WalletBalance, WalletStatusesEnum } from '../shared/entity-services/wallets/interfaces'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { PaginationParams } from '../core/interfaces'
import { Cryptocurrency, CryptocurrencyImage } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { OwnedCryptocurrenciesMetadata } from './types'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { GnosisWalletInfo } from '../domain/block-explorers/gnosis/interfaces'

export class CryptocurrencyMetadataDto {
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
      thumb:
        'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/USDC_usd-coin_7eb722d7-e986-405e-a01c-b018bc710593_thumb.png',
      small:
        'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/USDC_usd-coin_7eb722d7-e986-405e-a01c-b018bc710593_small.png',
      large:
        'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/USDC_usd-coin_7eb722d7-e986-405e-a01c-b018bc710593_large.png'
    }
  })
  @IsNotEmpty()
  image: CryptocurrencyImage

  static map(cryptocurrency: Cryptocurrency): CryptocurrencyMetadataDto {
    const result = new CryptocurrencyMetadataDto()
    result.name = cryptocurrency.name
    result.publicId = cryptocurrency.publicId
    result.symbol = cryptocurrency.symbol
    result.image = cryptocurrency.image ?? {
      large: '',
      thumb: '',
      small: ''
    }
    return result
  }
}

export class WalletGroupDto {
  @ApiProperty({ example: 'f290353a-9607-4c90-9aef-78b1330a98a5' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'First Group' })
  @IsNotEmpty()
  name: string

  public static map(wallet: WalletGroup): WalletGroupDto {
    const walletGroupDto = new WalletGroupDto()
    walletGroupDto.id = wallet?.publicId
    walletGroupDto.name = wallet?.name
    return walletGroupDto
  }
}

export class WalletDto {
  @ApiProperty({ example: '3461ff8b-b8a7-470e-9d4e-21bf04e653c6' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'New Wallet' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: '0xb0c25128707833EAf7B51707d5f2bc31e16FBdd4' })
  address: string

  @ApiProperty({ enum: SourceType, example: SourceType.ETH })
  sourceType: SourceType

  @ApiProperty({ nullable: true, example: '2021-01-01T00:00:00.000Z' })
  flaggedAt: Date

  @ApiProperty()
  group: WalletGroupDto

  @ApiProperty()
  balance: WalletBalance

  @ApiProperty({ enum: WalletStatusesEnum, example: WalletStatusesEnum.SYNCED })
  status: WalletStatusesEnum

  @ApiProperty()
  metadata: GnosisWalletInfo[] | null

  @ApiProperty({ example: '2023-02-28T07:58:47.000Z' })
  lastSyncedAt: Date

  @ApiProperty({ example: '2023-02-28T07:58:47.000Z' })
  createdAt: Date

  @ApiProperty({ example: [SupportedBlockchains.ETHEREUM_MAINNET] })
  supportedBlockchains: string[]

  @ApiProperty()
  ownedCryptocurrencies: OwnedCryptocurrenciesMetadata

  public static map(params: {
    wallet: Wallet
    cryptocurrencies?: Cryptocurrency[]
    enabledBlockchainIds: string[]
    contacts?: { [address: string]: ContactDto }
  }): WalletDto {
    const wallet = params.wallet
    const cryptocurrencies = params.cryptocurrencies ?? []
    const enabledBlockchainsId = params.enabledBlockchainIds ?? []

    const walletDto = new WalletDto()
    walletDto.id = wallet.publicId
    walletDto.name = wallet.name
    // Only apply checksum for Ethereum addresses, not Solana
    walletDto.address = wallet.sourceType === SourceType.SOL ? wallet.address : toChecksumAddress(wallet.address)
    walletDto.sourceType = wallet.sourceType
    walletDto.flaggedAt = wallet.flaggedAt
    walletDto.group = WalletGroupDto.map(wallet.walletGroup)
    walletDto.balance = wallet.balance || null
    walletDto.status = wallet.status
    if (wallet.sourceType === SourceType.GNOSIS && wallet.metadata) {
      if (params.contacts) {
        walletDto.metadata = wallet.metadata.map((value) => {
          return {
            ...value,
            ownerAddresses: value.ownerAddresses.map((owner) => ({
              ...owner,
              contact: params.contacts[owner.address.toLowerCase()] || null
            }))
          }
        })
      } else {
        walletDto.metadata = wallet.metadata
      }
    } else {
      walletDto.metadata = null
    }
    walletDto.lastSyncedAt = wallet.lastSyncedAt || null
    walletDto.createdAt = wallet.createdAt || null
    walletDto.supportedBlockchains = enabledBlockchainsId.filter(
      (blockchainId) => wallet.supportedBlockchains?.includes(blockchainId) ?? false
    )

    walletDto.ownedCryptocurrencies = {}
    if (wallet.ownedCryptocurrencies) {
      for (const blockchainId of walletDto.supportedBlockchains) {
        const ownedCryptocurrencies: string[] = wallet.ownedCryptocurrencies[blockchainId]
        if (!ownedCryptocurrencies) {
          continue
        }
        const currencyMetadata: CryptocurrencyMetadataDto[] = ownedCryptocurrencies.map((cryptocurrencyId) => {
          const cryptocurrency = cryptocurrencies.find((c) => c.id === cryptocurrencyId)
          return cryptocurrency ? CryptocurrencyMetadataDto.map(cryptocurrency) : null
        })
        walletDto.ownedCryptocurrencies[blockchainId] = currencyMetadata.filter((c) => c !== null)
      }
    }

    if (wallet.balance) {
      walletDto.balance = {
        lastSyncedAt: wallet.lastSyncedAt,
        blockchains: {}
      }
      for (const blockchainId of walletDto.supportedBlockchains) {
        const tokenBalance = wallet.balance.blockchains?.[blockchainId]
        if (!tokenBalance) {
          continue
        }
        walletDto.balance.blockchains[blockchainId] = tokenBalance
      }
      walletDto.balance = wallet.balance
    }

    return walletDto
  }
}

export class UpdateWalletDto {
  @ApiProperty({ example: 'My Wallet' })
  name: string

  @ApiProperty({ nullable: true, example: true })
  flagged?: boolean

  @ApiProperty({ example: 'f290353a-9607-4c90-9aef-78b1330a98a5' })
  @IsUUID()
  walletGroupId: string

  @IsOptional()
  @IsArray()
  @IsEnum(SupportedBlockchains, { each: true })
  @ArrayMinSize(1)
  @ToArray()
  @ApiProperty({
    description: 'Get enum from the publicId of blockchains endpoint',
    isArray: true,
    enum: SupportedBlockchains,
    example: [SupportedBlockchains.ETHEREUM_MAINNET]
  })
  supportedBlockchains: string[]
}

export class CreateWalletDto {
  @ApiProperty({ example: 'My Group' })
  name: string

  @IsNotEmpty()
  @IsEthereumOrSolanaAddress({ message: 'address must be a valid Ethereum or Solana address' })
  @Transform(({ value, obj }) => {
    // Preserve case for SOL addresses, lowercase for others
    return obj.sourceType === 'sol' ? value : value.toLowerCase()
  })
  @ApiProperty({ example: '0x0000000000000000000000000000000000000000' })
  address: string

  @IsNotEmpty()
  @ApiProperty({ enum: SourceType, example: SourceType.ETH })
  sourceType: SourceType

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' })
  walletGroupId: string

  // @IsNotEmpty()
  @IsOptional()
  @IsArray()
  @IsEnum(SupportedBlockchains, { each: true })
  @ToArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Get enum from the publicId of blockchains endpoint',
    isArray: true,
    enum: SupportedBlockchains,
    example: [SupportedBlockchains.ETHEREUM_MAINNET]
  })
  supportedBlockchains: string[]

  // TODO: <legacy>  only for gnosis safe. Delete after multichain release
  @IsOptional()
  @IsEnum(SupportedBlockchains)
  @ApiProperty({ description: 'Get enum from the publicId of blockchains endpoint' })
  blockchainId: string
}

export class WalletQueryParams extends PaginationParams {
  @IsOptional()
  @IsArray()
  @ToArray()
  @IsEnum(WalletStatusesEnum, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    enum: WalletStatusesEnum,
    example: [WalletStatusesEnum.SYNCED, WalletStatusesEnum.SYNCING]
  })
  statuses?: WalletStatusesEnum[]

  @IsArray()
  @IsOptional()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['9c8f7b01-777f-4a0f-9841-5d7d7e844442', '54a2621d-cbaa-4500-b91a-fb21b5070422']
  })
  walletGroupIds?: string[]

  // @deprecated. We don't use it anymore
  @IsArray()
  @IsOptional()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad', 'a9cfbdeb-84d0-2dbb-ad3a-e6b1d063c5ad']
  })
  assetIds?: string[]

  @IsOptional()
  @ToArray()
  @IsString({ each: true })
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint',
    required: false
  })
  blockchainIds?: string[]

  @IsOptional()
  @ToBoolean()
  @ApiPropertyOptional({
    example: true,
    description: 'Add cryptocurrency metadata to the response',
    required: false
  })
  includeCryptocurrencyMetadata?: boolean
}
