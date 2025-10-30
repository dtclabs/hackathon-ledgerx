import { IPayment } from '@/api-v2/payment-api'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface IDraftsState {
  makePaymentDrafts: IPayment[]
}

const initialState: IDraftsState = {
  makePaymentDrafts: []
}

export const draftsSlice = createSlice({
  name: 'drafts-slice',
  initialState,
  reducers: {
    setMakePaymentDrafts: (state, action: PayloadAction<IPayment[]>) => {
      state.makePaymentDrafts = action.payload
    }
  }
})

export const { setMakePaymentDrafts } = draftsSlice.actions
