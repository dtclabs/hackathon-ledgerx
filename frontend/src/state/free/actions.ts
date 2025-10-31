import { createAction } from '@reduxjs/toolkit'
import { ILiteSource, IRecentlyTransaction } from './interface'

export const pushTransaction = createAction<IRecentlyTransaction>('free/pushTransaction')
export const removeTransaction = createAction<string>('free/removeTransaction')
export const removeAllTransactions = createAction('free/removeAllTransactions')
export const removeCompletedTransactions = createAction('free/removeCompletedTransactions')
export const setTransactions = createAction<IRecentlyTransaction[]>('free/setTransactions')
export const setResetBalance = createAction('free/setResetBalance')
export const setResetMetamaskBalance = createAction('free/setResetMetamaskBalance')
export const executed = createAction<string>('free/executed')
export const importSource = createAction<ILiteSource>('free/importSource')
export const selectSource = createAction<ILiteSource>('free/selectSource')
export const updateSourceByAddress = createAction<ILiteSource>('free/updateSourceByAddress')
export const resetSourceList = createAction('free/resetSourceList')
