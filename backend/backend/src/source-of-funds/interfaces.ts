import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { } from 'class-validator'
import { IsEthereumOrSolanaAddress } from '../shared/validators/address.validator'

export enum SafeOwnerState {
  CURRENT = 'current',
  NEW = 'new',
  OLD = 'old',
  REMOVING = 'removing'
}

export enum SourceType {
  FTX = 'FTX',
  GNOSIS = 'Gnosis',
  COINBASE = 'Coinbase',
  CDC = 'CDC',
  ETH = 'ETH'
}

export interface TokenBalance {
  id: string
  name: string
  balance: string
  usd: number
  decimals: number
}
export interface SourceBalance {
  [n: string]: TokenBalance[]
}

export class SafeOwner {
  @ApiProperty()
  name: string

  @IsEthereumOrSolanaAddress({ message: 'address must be a valid Ethereum or Solana address' })
  @ApiProperty({ example: '0x0000000000000000000000000000000000000000' })
  address: string

  @ApiPropertyOptional({ enum: SafeOwnerState, default: SafeOwnerState.CURRENT })
  state?: string
}
