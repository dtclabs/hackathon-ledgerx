import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { WalletGroup } from '../shared/entity-services/wallet-groups/wallet-group.entity'
import { SourceType } from '../shared/entity-services/wallets/interfaces'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { toChecksumAddress } from 'web3-utils'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'

export class WalletGroupDto {
  @ApiProperty({ example: 'f290353a-9607-4c90-9aef-78b1330a98a5' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'First Group' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 2 })
  walletsSize: number

  @ApiProperty({ example: [SupportedBlockchains.ETHEREUM_MAINNET] })
  supportedBlockchains: string[]

  public static map(walletGroup: WalletGroup): WalletGroupDto {
    const walletGroupDto = new WalletGroupDto()
    walletGroupDto.id = walletGroup?.publicId
    walletGroupDto.name = walletGroup?.name
    walletGroupDto.walletsSize = walletGroup?.wallets?.length || 0
    // get unique supported blockchains from walletGroup.wallets.supportedBlockchains
    walletGroupDto.supportedBlockchains = walletGroup?.wallets?.reduce((acc, wallet) => {
      const uniqueBlockchains = wallet.supportedBlockchains.filter((blockchain) => !acc.includes(blockchain))
      return [...acc, ...uniqueBlockchains]
    }, [])
    return walletGroupDto
  }
}

export class UpdateWalletGroupDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'First Group' })
  name: string
}

export class CreateWalletGroupDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'First Group' })
  name: string
}

export class WalletGroupListDto {
  @ApiProperty({ example: 'f290353a-9607-4c90-9aef-78b1330a98a5' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'First Group' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 2 })
  walletsSize: number

  @ApiProperty({
    isArray: true,
    type: () => WalletListDto
  })
  wallets: WalletListDto[]

  @ApiProperty({ example: [SupportedBlockchains.ETHEREUM_MAINNET] })
  supportedBlockchains: string[]

  public static map(walletGroup: WalletGroup): WalletGroupListDto {
    const walletGroupDto = new WalletGroupListDto()
    walletGroupDto.id = walletGroup.publicId
    walletGroupDto.name = walletGroup.name
    walletGroupDto.walletsSize = walletGroup.wallets?.length || 0
    walletGroupDto.wallets = walletGroup.wallets?.map((wallet) => WalletListDto.map(wallet)) || []
    walletGroupDto.supportedBlockchains = walletGroup?.wallets?.reduce((acc, wallet) => {
      const uniqueBlockchains = wallet.supportedBlockchains.filter((blockchain) => !acc.includes(blockchain))
      return [...acc, ...uniqueBlockchains]
    }, [])
    return walletGroupDto
  }
}

export class WalletListDto {
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

  @ApiProperty({ example: [SupportedBlockchains.ETHEREUM_MAINNET] })
  supportedBlockchains: string[]

  public static map(wallet: Wallet): WalletListDto {
    const walletDto = new WalletListDto()
    walletDto.id = wallet.publicId
    walletDto.name = wallet.name
    walletDto.address = toChecksumAddress(wallet.address)
    walletDto.sourceType = wallet.sourceType
    walletDto.supportedBlockchains = wallet.supportedBlockchains
    return walletDto
  }
}
