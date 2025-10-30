import { AppState } from '@/state'

export const selectFeatureState = (state: AppState, feature: string, userId?: string): boolean => {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT
  const featureData = state.featureFlag?.[feature] ?? false

  if (!featureData) return false

  if (userId && featureData.users && featureData.users.includes(userId)) {
    return true
  }

  if (featureData.env && featureData.env.includes(env)) {
    return true
  }

  return false
}
