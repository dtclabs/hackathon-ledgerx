import { IRecipientItemForm } from '@/views/Transfer/Transfer.types'

export interface IToken {
  [cryptocurrencyId: string]: string
}

export interface IChainTokenApprovals {
  [chainId: string]: IToken
}

export interface ITransferSliceState {
  walletApprovals: { [walletId: string]: IChainTokenApprovals }
  reviewData: IReviewData
  isEoaTransfer: boolean
}

export interface IReviewData {
  sourceWalletId: string
  recipients: IRecipientItemForm[]
}
