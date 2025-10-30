import { api } from '@/api-v2'
import { AppState } from '@/state'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { ICardOnboardingStep, MOCK } from './cards-type'

export interface ICardsState {
  onboardingStep: ICardOnboardingStep
}

const initialState: ICardsState = {
  // onboardingStep: MOCK // uncomment to test card list
  onboardingStep: null
}

export const cardsSlice = createSlice({
  name: 'cards-slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      // @ts-ignore
      api.endpoints.getCardOnboardingStep.matchFulfilled,
      (state, { payload }) => {
        state.onboardingStep = payload
      }
    )
  }
})

const selectSelf = (state: AppState) => state.cards

export const cardOnboardingStepSelector = createSelector(selectSelf, (state) => state.onboardingStep)
