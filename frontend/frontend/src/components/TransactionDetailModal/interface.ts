import { ICategories } from '@/slice/categories/interfaces'
import { ITransaction } from '@/slice/old-tx/interface'
import { IDataBody, IDataHeader } from '@/components/Table/types'
import { ITab } from '@/components/TabsComponent/Tabs'
import { IEditAdditional } from '@/views/TransferApp/interface'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
// import { InputData } from 'ethereum-input-data-decoder'
import { Dispatch, MouseEvent, SetStateAction } from 'react'
import { IFileObject } from '@/hooks-v2/useFileDownload'
import { ISource } from '@/slice/wallets/wallet-types'

export interface IOutgoingTableProps {
  dataOutgoing: ITransaction[]
  isSafe: (sourceId: string) => ISource
  onShowTransactionDetail: (item: ITransaction) => void
}
export interface IIncomingTableProps {
  dataIncoming: ITransaction[]
  isSafe: (sourceId: string) => ISource
  onShowTransactionDetail: (item: ITransaction) => void
}
export interface IScheduledTableProps {
  dataHeader: IDataHeader[]
  dataBody: IDataBody[]
}
export interface ITransactionHistoryProps {
  price: any
  showImportFund?: boolean
  onShowImportFund?: () => void
}
export interface IDataTransaction {
  data: ITransaction[]
  price: any
}
export interface ITransactionDetail {
  transactionValue: ITransaction
  token: IToken
  onShowTransactionMetaMask: (item: any) => void
  dataDecoded: any
  // dataDecoded: InputData
}

export interface IToken {
  decimal: number
  logoUrl: string
  name: string
  tokenAddress: string
  tokenId: string
}

export interface ITransactionInfo {
  values: ITransaction
  isIncoming: boolean
  source: ISource
  hasRepeat?: boolean
  onShowTransactionDetail: (item: ITransaction) => void
}

export interface ITransactionDetailModal {
  showModal: boolean
  nonExecuteLoading?: boolean
  isSource?: (sourceId: string) => ISource
  transactionId: string
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>
  queue?: boolean
  transactionDetailTabs: ITab[]
  categories?: ICategories[]
  refetch?: () => void
  additionalValue?: IEditAdditional
  setAdditionalValue?: Dispatch<SetStateAction<IEditAdditional>>
  title?: string
  onReject?: (transaction: ITransaction, sourceId: string, e: any, callback?: any) => Promise<void>
  onExecuted?: ({
    e,
    sourceId,
    transaction,
    callback
  }: {
    transaction: ITransaction
    sourceId: string
    e
    callback?: () => void
  }) => Promise<void>
  onSign?: (transaction: ITransaction, sourceId: string, e: any, callback?: () => void) => Promise<void>
  confirmLoading?: boolean
  executeLoading?: boolean
  isTransactionSignedByAddress?: (signerAddress: string, transaction: SafeMultisigTransactionResponse) => boolean
  isTransactionExecutable?: (safeThreshold: number, transaction: SafeMultisigTransactionResponse) => boolean
  index?: number
  chainId?: number
  handleBulkDownload?: (files: IFileObject[]) => void
  setShowExecuteModal?: (show: boolean) => void
  setShowRejectionModal?: (show: boolean) => void
}
export interface IOverviewTransactionDetail {
  transactionValueOverview: ITransaction
}

export enum EKeyTransactionDetail {
  OVERVIEW = 'Overview',
  RECIPIENTS = 'Recipients',
  SIGNERS = 'Signers',
  ADDITIONAL = 'Additional Details'
}
export enum ETypeTransactions {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
  PENDING = 'pending'
}
export enum ETypeSelectCategory {
  DEFAULT = 'default'
}
