import { IOrganization } from '../organization/organization.types'

export enum ESourceOwnerState {
  CURRENT = 'current',
  NEW = 'new',
  OLD = 'old',
  REMOVING = 'removing'
}

export enum EImportSafeStep {
  FORM = 'Form',
  REVIEW = 'Review'
}

export enum SourceType {
  GNOSIS = 'gnosis',
  ETH = 'eth'
}

export const DEFAULT_WALLET_GROUP_NAME = 'Default Group'
export interface IWalletItem {
  id: string
  name: string
  address: string
  sourceType: string
  flaggedAt: null | string
  group: {
    id: string
    name: string
  }
  balance: {
    lastSyncedAt: string
    blockchains: IBlockchainItem
  }
  status: string
  metadata: null | any
  lastSyncedAt: string
}

interface IBlockchainItem {
  [key: string]: ICryptocurrencyItem
}

interface ICryptocurrencyItem {
  name: string
  publicId: string
  symbol: string
  image: {
    thumb: string
    small: string
    large: string
  }
  isVerified: boolean
  addresses: [
    {
      blockchainId: string
      type: string
      decimal: number
      address: null | string
    }
  ]
}

export interface IPaginatedResponse {
  currentPage: number
  limit: number
  totalPages: number
  totalItems: number
}

export interface IPostWallet {
  payload: {
    name: string
    address: string
    sourceType: string
    walletGroupId: string
    blockchainId?: string
    supportedBlockchains?: string[] // TODO: Make it compulsory when multichain fully integrated
  }
  orgId: string
}

export interface IWalletParams {
  assetIds: string[]
  walletGroupIds: string[]
  blockchainIds: string[]
}

export interface IDeleteWallet {
  payload: {
    id: string
  }
  orgId: string
}

export interface IUpdateWallet {
  payload: {
    name: string
    flagged: boolean
    walletGroupId: string
    supportedBlockchains?: string[] // TODO: Make it compulsory when multichain fully integrated
  }
  orgId: string
  id: string
}

interface IMetadata {
  blockchainId: string
  nonce: number
  ownerAddresses: any
  threshold: number
}

export interface ISource {
  name: string
  isAvailable?: boolean
  organization: IOrganization
  sourceId?: string // No longer have this
  sourceType: SourceType
  deletedAt: string | null
  balance: {
    [chainId: number]: ISourceBalance[]
  }
  id: string
  publicId: string
  createdAt: string
  updatedAt: string
  address?: string
  threshold?: number
  chainId?: number
  ownerAddresses?: ISourceOwner[]
  totalPiceSource?: number
  disabled?: boolean
  supportedBlockchains?: string[]
  chainBalance?: any
  metadata?: IMetadata | IMetadata[]
}

interface ISourceBalance {
  balance: string
  decimals: number
  id: string
  name: string
  usd: number
}

interface ISourceOwner {
  name: string
  address: string
  state: ESourceOwnerState
}

export interface IUpdateSource {
  name?: string
  disabled?: boolean
  id?: string
}
