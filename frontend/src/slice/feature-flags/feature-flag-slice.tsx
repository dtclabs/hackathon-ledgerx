import { createSlice } from '@reduxjs/toolkit'
import { featureFlagApi } from '@/api-v2/feature-flag'

interface FeatureFlag {
  env?: string[]
  users?: string[]
  isEnabled?: boolean
}

interface FeatureFlagState {
  [featureName: string]: FeatureFlag
}

const initialState: FeatureFlagState = {
  isDtcEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isNftEnabled: {
    env: []
  },
  isNewLoginEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isNewExportsCSVEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isNewHQTransactEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isMultiLinePaymentEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isBankFeedEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isXeroCertificationEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isDraftTransactionsEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isQueueTransactionsEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isSpotBalanceEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isAnnotationEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isOffRampEnabled: {
    env: ['localhost', 'development', 'staging', 'production']
  },
  isBatchExecuteEnabled: {
    env: ['localhost', 'development', 'staging', 'production', 'demo']
  },
  isMultiChainSafeEnabled: {
    env: ['localhost', 'development', 'staging', 'production']
  },
  isCardsEnabled: {
    env: ['localhost']
  },
  rootfiService: {
    isEnabled: false
  }
}

export const featureFlagSlice = createSlice({
  name: 'feature-flags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      featureFlagApi.endpoints.getFeatureFlags.matchFulfilled,
      (state, { payload }) => {
        state.rootfiService.isEnabled = payload?.data?.isEnabled
      }
    )
  }
})

export default featureFlagSlice.reducer
