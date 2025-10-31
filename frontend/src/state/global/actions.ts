import { createAction } from '@reduxjs/toolkit'

export const setCurrentPage = createAction<string>('global/setCurrentPage')
export const setGlobalError = createAction<string | null>('global/setGlobalError')
