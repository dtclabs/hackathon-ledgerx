import { IChainItem } from '@/api-v2/chain-api'
import { IWalletParams } from '@/slice/wallets/wallet-types'

export interface IBalanceAllocationProps {
  data: IScoreRatingProps[]
  hasAddedfund?: boolean
  token?: boolean
  emptyState: React.ReactNode
  loading?: boolean
  setShowImportedFund?: (data: boolean) => void
  showImportedFund?: boolean
  onShowImportedFund?: () => void
  textSearch?: string
  onChangeSearch?: (e) => void
  onResetSearch?: () => void
  size?: any
  page?: number
  filter?: IWalletParams
  setPage?: (page: number) => void
  setSize?: (size: any) => void
  setFilter?: (filter: IWalletParams) => void
  totalItems?: number
  totalPages?: number
  groupsData?: any[]
  title?: string
  subTitle?: string
  tokensData?: any
  balanceDirection?: boolean
  onChangeDirection?: () => void
}

export interface IScoreRatingProps {
  className?: string
  disabled?: boolean
  total?: string | number
  id?: string
  type?: string
  fiatCurrency?: string
  rating: number
  title: string
  subTitle: string
  price: string
  balance?: number
  subPrice?: string
  iconRight?: any
  iconEdit?: any
  iconLeft?: React.ReactNode
  iconFlag?: any
  token?: boolean
  onButtonClick?: (e) => void
  onEditButton?: (e) => void
  onFlagButton?: (e) => void
  address?: string
  flag?: boolean
  lastUpdate?: string
  assets?: any
  group?: any
  chains?: IChainItem[]
  supportedChains?: any
}

export enum EType {
  CREATE = 'CREATE',
  IMPORT = 'IMPORT'
}
