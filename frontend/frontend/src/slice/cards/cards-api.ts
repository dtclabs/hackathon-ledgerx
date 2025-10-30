import { api } from '@/api-v2'
import { ICard, ICardOnboardingStep, ICardTransaction, ICreateCardPayload } from './cards-type'
import { IGetAllOptions, IPagination } from '@/api/interface'

const cardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCardOnboardingStep: builder.query<ICardOnboardingStep, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/onboarding/card/onboarding_steps`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['card-onboarding']
    }),
    whitelistWallet: builder.mutation<any, any>({
      query: ({ organizationId, payload }) => ({
        url: `${organizationId}/onboarding/card/onboarding_steps/whitelist_address/register`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['card-onboarding']
    }),
    knowYourBusiness: builder.mutation<any, any>({
      query: ({ organizationId, payload }) => ({
        url: `${organizationId}/onboarding/card/onboarding_steps/know_your_business`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['card-onboarding']
    }),

    getCards: builder.query<IPagination<ICard>, { organizationId: string; params?: IGetAllOptions }>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/cards`,
        params,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['cards']
    }),
    createCard: builder.mutation<any, { organizationId: string; payload: ICreateCardPayload }>({
      query: ({ organizationId, payload }) => ({
        url: `${organizationId}/cards`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['cards']
    }),

    getCardTransactions: builder.query<
      IPagination<ICardTransaction>,
      { organizationId: string; params?: IGetAllOptions }
    >({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/cards/transactions`,
        params,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['cards']
    })
  })
})

export const {
  useGetCardOnboardingStepQuery,
  useKnowYourBusinessMutation,
  useWhitelistWalletMutation,
  useCreateCardMutation,
  useGetCardsQuery,
  useGetCardTransactionsQuery
} = cardApi
