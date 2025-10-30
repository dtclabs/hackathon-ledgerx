import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { BalanceGroupByFieldEnum } from '../balances/types'

export interface PortfolioOverview {
  totalBalance: {
    value: string
    currency: string
    formatted: string
  }
  holdings: TokenHolding[]
  summary: {
    totalWallets: number
    totalTokens: number
    topHolding: TokenHolding | null
    lastUpdated: Date
  }
  breakdown: ChartDataPoint[]
}

export interface TokenHolding {
  symbol: string
  name: string
  amount: string
  valueUsd: string
  formattedValue: string
  percentage: string
  formattedPercentage: string
  priceUsd: string
  address: string
  color: string
}

export interface ChartDataPoint {
  symbol: string
  name: string
  value: string
  percentage: string
  color: string
}

export interface PortfolioBalance {
  value: string
  fiatCurrency: string
  groups?: any
}

export class PortfolioQueryParams {
  @IsOptional()
  @ToArray()
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiProperty({
    isArray: true,
    example: [SupportedBlockchains.SOLANA_MAINNET],
    description: 'Filter by blockchain IDs. Supports Solana and EVM blockchains',
    required: false
  })
  blockchainIds?: string[]

  @IsOptional()
  @ToArray()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiProperty({
    isArray: true,
    example: ['9c8f7b01-777f-4a0f-9841-5d7d7e844442'],
    description: 'Filter by wallet public IDs',
    required: false
  })
  walletIds?: string[]

  @IsOptional()
  @IsEnum([BalanceGroupByFieldEnum.WALLET_ID, BalanceGroupByFieldEnum.BLOCKCHAIN_ID])
  @ApiProperty({
    example: BalanceGroupByFieldEnum.WALLET_ID,
    description: 'Group balance by property (for EVM compatibility)',
    required: false
  })
  groupBy?: BalanceGroupByFieldEnum

  @IsOptional()
  @ApiProperty({
    example: 'USD',
    description: 'Fiat currency for balance calculation',
    required: false
  })
  fiatCurrency?: string

  @IsOptional()
  @ApiProperty({
    description: 'Include positions with zero balance',
    required: false
  })
  includeZeroBalances?: boolean
}

export class PortfolioOverviewDto {
  @ApiProperty({
    description: 'Total portfolio value',
    example: {
      value: '2456789.50',
      currency: 'USD',
      formatted: '$2,456,789.50 USD'
    }
  })
  totalBalance: {
    value: string
    currency: string
    formatted: string
  }

  @ApiProperty({
    description: 'Individual token holdings',
    type: [Object],
    example: [
      {
        symbol: 'SOL',
        name: 'Solana',
        amount: '10000.00',
        valueUsd: '1000000.00',
        formattedValue: '$1,000,000 USD',
        percentage: '40.70',
        formattedPercentage: '40.70%',
        priceUsd: '100.00',
        address: 'native',
        color: '#9945FF'
      }
    ]
  })
  holdings: TokenHolding[]

  @ApiProperty({
    description: 'Portfolio summary statistics',
    example: {
      totalWallets: 3,
      totalTokens: 5,
      topHolding: null,
      lastUpdated: '2025-10-15T16:00:00.000Z'
    }
  })
  summary: {
    totalWallets: number
    totalTokens: number
    topHolding: TokenHolding | null
    lastUpdated: Date
  }

  @ApiProperty({
    description: 'Chart breakdown data',
    type: [Object],
    example: [
      {
        symbol: 'SOL',
        name: 'Solana', 
        value: '1000000.00',
        percentage: '40.70',
        color: '#9945FF'
      }
    ]
  })
  breakdown: ChartDataPoint[]
}