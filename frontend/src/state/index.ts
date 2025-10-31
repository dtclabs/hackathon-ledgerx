import { combineReducers, configureStore, createAction, CombinedState } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import user from './user/reducer'
import global from './global/reducer'
import free from './free/reducer'
import source from './source/reducer'
import { api } from '../api-v2'
import { accountSlice } from '@/slice/account/account-slice'
import { authSlice } from '@/slice/authentication/auththentication.slice'
import { orgSettingsSlice } from '@/slice/orgSettings/orgSettings-slice'
import { walletSlice } from '@/slice/wallets/wallet-slice'
import { platformSlice } from '@/slice/platform/platform-slice'
import { categoriesSlice } from '@/slice/categories/categories-slice'
import { transactionsSlice } from '@/slice/old-tx/transactions-slide'
import { chartOfAccountsMappingSlice } from '@/slice/chart-of-account-mappings/chart-of-account-mappings-slice'
import { chartOfAccountSlice } from '@/slice/chart-of-accounts/chart-of-accounts-slice'
import { cryptocurrencySlice } from '@/slice/cryptocurrencies/cryptocurrency-slice'
import { assetSlice } from '@/slice/assets/asset-slice'
import { chainsSlice } from '@/slice/chains/chains-slice'
import { balancesSlice } from '@/slice/balances/balance-slice'
import { subscriptionSlice } from '@/slice/subscription/subscription-slice'
import { orgIntegrationSlice } from '@/slice/org-integration/org-integration-slice'
import { featureFlagSlice } from '@/slice/feature-flags/feature-flag-slice'
import { organizationSlice } from '@/slice/organization/organization.slice'
import { draftsSlice } from '@/slice/drafts/drafts-slice'
import { contactsSlice } from '@/slice/contacts/contacts-slice'
import { transferSlice } from '@/slice/transfer/transfer.slice'
import { cardsSlice } from '@/slice/cards/cards-slice'

export const resetGlobalState = createAction('reset/INITIAL_STATE')

const appReducer = combineReducers({
  user,
  global,
  source,
  free,
  [api.reducerPath]: api.reducer,
  platform: platformSlice.reducer,
  assets: assetSlice.reducer,
  transaction: transactionsSlice.reducer,
  categories: categoriesSlice.reducer,
  wallets: walletSlice.reducer,
  accountV2: accountSlice.reducer,
  auth: authSlice.reducer,
  orgSettings: orgSettingsSlice.reducer,
  supportedChains: chainsSlice.reducer,
  chartOfAccountsMappings: chartOfAccountsMappingSlice.reducer,
  chartOfAccounts: chartOfAccountSlice.reducer,
  balancePerChainForOrg: balancesSlice.reducer,
  balanceForWalletsGroupedByChain: balancesSlice.reducer,
  subscription: subscriptionSlice.reducer,
  orgIntegration: orgIntegrationSlice.reducer,
  featureFlag: featureFlagSlice.reducer,
  cryptocurrencies: cryptocurrencySlice.reducer,
  organization: organizationSlice.reducer,
  drafts: draftsSlice.reducer,
  contacts: contactsSlice.reducer,
  transfer: transferSlice.reducer,
  cards: cardsSlice.reducer
})

const reducerMiddleware = (
  state: ReturnType<typeof store.getState>,
  action: any
): ReturnType<typeof store.getState> => {
  if (action.type === resetGlobalState().type) {
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

export const store = configureStore({
  reducer: reducerMiddleware,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'localhost'
})

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector

export default store
