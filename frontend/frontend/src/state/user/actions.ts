import { createAction } from '@reduxjs/toolkit'

export const logOut = createAction('user/logOut')
export const connectingWallet = createAction<string>('user/connectingWallet')
export const showWelcome = createAction<boolean>('user/showWelcome')
