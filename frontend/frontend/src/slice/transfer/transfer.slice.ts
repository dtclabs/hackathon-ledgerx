import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ITransferSliceState } from './transfer.types'
import { IRecipientItemForm } from '@/views/Transfer/Transfer.types'

const initialState: ITransferSliceState = {
  walletApprovals: {},
  isEoaTransfer: false,
  reviewData: {
    sourceWalletId: '',
    recipients: []
  }
}

export const transferSlice = createSlice({
  name: 'transfer-slice',
  initialState,
  reducers: {
    updateReviewData: (
      state,
      action: PayloadAction<{
        sourceWalletId: string
        recipients: IRecipientItemForm[]
      }>
    ) => {
      if (action.payload.sourceWalletId) {
        state.reviewData.sourceWalletId = action.payload.sourceWalletId
      }
      if (action.payload.recipients) {
        state.reviewData.recipients = action.payload.recipients
      }
    },
    setIsEoaTransfer: (state, action: PayloadAction<boolean>) => {
      state.isEoaTransfer = action.payload
    },
    updateWalletApproval: (
      state,
      action: PayloadAction<{ tokenId: string; chainId: string; amount: string; walletId: string }>
    ) => {
      const { tokenId, chainId, amount } = action.payload
      const isWallet = state.walletApprovals[action.payload.walletId]
      if (isWallet) {
        const isChain = state.walletApprovals[action.payload.walletId][chainId]
        if (isChain) {
          state.walletApprovals[action.payload.walletId][chainId][tokenId] = amount
        } else {
          state.walletApprovals[action.payload.walletId][chainId] = {
            [tokenId]: amount
          }
        }
      } else {
        state.walletApprovals[action.payload.walletId] = {
          [chainId]: {
            [tokenId]: amount
          }
        }
      }
    },
    resetTransferSlice: (state) => initialState
  }
})

export const { resetTransferSlice, updateWalletApproval, updateReviewData, setIsEoaTransfer } = transferSlice.actions
