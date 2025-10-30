import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsUUID, Validate } from 'class-validator'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { MustUseWith } from '../shared/decorators/validators/validators'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { BalanceGroupByFieldEnum, BalanceGroupType } from './types'

export class BalanceDto {
  @IsNotEmpty()
  @ApiProperty({ example: '1000' })
  value: string

  @IsNotEmpty()
  @ApiProperty({ example: 'USD' })
  fiatCurrency: string

  @ApiProperty()
  groups?: BalanceGroupType

  @ApiProperty({ required: false, example: 'https://example.com/token-icon.png' })
  imageUrl?: string
}

export class AssetBalanceQueryParams {
  @IsOptional()
  @ToArray()
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiProperty({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET, SupportedBlockchains.SOLANA_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint. Supports both EVM and Solana blockchains',
    required: false
  })
  blockchainIds?: string[]

  @IsOptional()
  @ToArray()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiProperty({
    isArray: true,
    example: ['9c8f7b01-777f-4a0f-9841-5d7d7e844442', '54a2621d-cbaa-4500-b91a-fb21b5070422'],
    required: false
  })
  walletIds?: string[]

  @IsOptional()
  @IsEnum([BalanceGroupByFieldEnum.WALLET_ID, BalanceGroupByFieldEnum.BLOCKCHAIN_ID])
  @ApiProperty({
    example: BalanceGroupByFieldEnum.WALLET_ID,
    description: 'Group balance by property',
    required: false
  })
  groupBy?: BalanceGroupByFieldEnum

  @IsOptional()
  @IsEnum([BalanceGroupByFieldEnum.BLOCKCHAIN_ID, BalanceGroupByFieldEnum.WALLET_ID])
  @Validate(MustUseWith, ['groupBy'])
  @ApiProperty({
    example: BalanceGroupByFieldEnum.BLOCKCHAIN_ID,
    description: 'Adding another level of grouping balance by property',
    required: false
  })
  secondGroupBy?: BalanceGroupByFieldEnum
}
