import { createAction } from '@reduxjs/toolkit'
import { WHITELIST_ENV } from '@/pages/[organizationId]/wallets'

export const resetSource = createAction('source/reset', () => ({
  payload: WHITELIST_ENV
}))
