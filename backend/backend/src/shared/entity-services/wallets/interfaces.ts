import { CryptocurrencyResponseDto } from '../../../cryptocurrencies/interfaces'
import { SupportedBlockchains } from '../blockchains/interfaces'
import { GnosisWalletInfo } from '../../../domain/block-explorers/gnosis/interfaces'

export enum WalletStatusesEnum {
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed'
}

export interface WalletBalance {
  lastSyncedAt: Date
  blockchains: WalletBalancePerBlockchain
}

export interface WalletStatusPerChain {
  [blockchainId: string]: WalletStatusesEnum
}

export interface WalletBalancePerBlockchain {
  [blockchainId: string]: TokenBalance[]
}
export interface TokenBalance {
  cryptocurrency: CryptocurrencyResponseDto
  cryptocurrencyAmount: string
  fiatCurrency: string
  fiatAmount: string
}

export enum SourceType {
  GNOSIS = 'gnosis',
  ETH = 'eth',
  SOL = 'sol'
}

export type WalletOwnedCryptocurrenciesMap = {
  [key in SupportedBlockchains]?: string[]
}

export interface GnosisWalletMetadata extends GnosisWalletInfo {
  creationTransactionInput?: string
}
