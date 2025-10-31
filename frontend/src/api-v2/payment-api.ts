/* eslint-disable arrow-body-style */
import { IPagination } from '@/api/interface'
import { api } from './index'
import { chunk } from 'lodash'
import { IAnnotation } from '@/slice/tags/tag-type'

export enum PaymentStatus {
  CREATED = 'created',
  PENDING = 'pending',
  APPROVED = 'approved',
  EXECUTING = 'executing',
  EXECUTED = 'executed',
  FAILED = 'failed',
  SYNCED = 'synced',
  INVALID = 'invalid'
}
export enum ProviderStatus {
  CREATED = 'created',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum CurrencyType {
  FIAT = 'fiat',
  CRYPTO = 'crypto'
}

export interface PaymentMetadataDto {
  purposeOfTransfer: string
  method?: any
  metamaskTransaction?: any
  safeTransaction?: any
}

export enum PurposeOfRemittance {
  OTHER_FEES = 'OTHER_FEES',
  INSURANCE_CLAIMS = 'INSURANCE_CLAIMS',
  MAINTENANCE_EXPENSES = 'MAINTENANCE_EXPENSES',
  SMALL_VALUE_REMITTANCE = 'SMALL_VALUE_REMITTANCE',
  TRANSPORTATION_FEES = 'TRANSPORTATION_FEES',
  GIFT_AND_DONATION = 'GIFT_AND_DONATION',
  OFFICE_EXPENSES = 'OFFICE_EXPENSES',
  EXPORTED_GOODS = 'EXPORTED_GOODS',
  PERSONAL_TRANSFER = 'PERSONAL_TRANSFER',
  OTHER = 'OTHER',
  LIBERALIZED_REMITTANCE = 'LIBERALIZED_REMITTANCE',
  TAX_PAYMENT = 'TAX_PAYMENT',
  MEDICAL_TREATMENT = 'MEDICAL_TREATMENT',
  SHARES_INVESTMENT = 'SHARES_INVESTMENT',
  ROYALTY_FEES = 'ROYALTY_FEES',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  BUSINESS_INSURANCE = 'BUSINESS_INSURANCE',
  ADVERTISING_EXPENSES = 'ADVERTISING_EXPENSES',
  TRAVEL = 'TRAVEL',
  DELIVERY_FEES = 'DELIVERY_FEES',
  PROPERTY_PURCHASE = 'PROPERTY_PURCHASE',
  FAMILY_SUPPORT = 'FAMILY_SUPPORT',
  UTILITY_BILLS = 'UTILITY_BILLS',
  CONSTRUCTION_EXPENSES = 'CONSTRUCTION_EXPENSES',
  PROPERTY_RENTAL = 'PROPERTY_RENTAL',
  SERVICE_CHARGES = 'SERVICE_CHARGES',
  HOTEL_ACCOMMODATION = 'HOTEL_ACCOMMODATION',
  SALARY_PAYMENT = 'SALARY_PAYMENT',
  EDUCATION = 'EDUCATION',
  ADVISORY_FEES = 'ADVISORY_FEES',
  FUND_INVESTMENT = 'FUND_INVESTMENT',
  COMPANY_EXPENSES = 'COMPANY_EXPENSES',
  BILLS = 'BILLS',
  INSURANCE = 'INSURANCE',
  INVESTMENT = 'INVESTMENT',
  REMITTANCE = 'REMITTANCE',
  HEALTH = 'HEALTH',
  TAXES = 'TAXES'
}

export interface ISubmitPaymentBody {
  id?: string
  destinationAddress?: string | null
  destinationName?: string | null
  destinationMetadata?: {
    id: string
    type: string
  } | null
  status: string
  paymentType?: string
  cryptocurrencyId?: string
  amount?: string
  blockchainId?: string
  sourceWalletId?: string
  chartOfAccountId: string
  notes: string
  remarks?: string
  files?: string[]
  reviewerId?: string
  reviewRequestedBy?: {
    name?: string
  }
  annotationIds?: string[]
  sourceCryptocurrencyId?: string
  destinationCurrencyType?: CurrencyType
  destinationCurrencyId?: string
  sourceAmount?: string
  destinationAmount?: string
  metadata?: PaymentMetadataDto
}

type IUpdatePaymentBody = Partial<ISubmitPaymentBody>

interface ISubmitPaymentParams {
  params: {
    organizationId: string
  }
  body: ISubmitPaymentBody[]
}

interface IUpdatePaymentParams {
  params: {
    organizationId: string
    paymentId?: string
  }
  body: IUpdatePaymentBody
  isOffRampEnabled?: boolean
}

interface ISetPaymentAsExecutedBody {
  id: string
  hash: string
  metadata?: {
    method: string
    metamaskTransaction: string
    safeTransaction: string
  }
}

interface ISetPaymentAsExecutedParams {
  params: {
    organizationId: string
  }
  body: ISetPaymentAsExecutedBody[]
}

interface ISetPaymentAsExecutingParams {
  params: {
    organizationId: string
  }
  body: {
    ids: string[]
    blockchainId: string
    sourceWalletId: string
    paymentType: string
    remarks: string
    proposedTransactionHash: string
  }
}

interface ISetPaymentAsFailedParams {
  params: {
    organizationId: string
  }
  body: {
    ids: string[]
  }
}
interface IDeletePaymentParams {
  params: {
    organizationId: string
    id: string
  }
}

interface ISetPaymentAsPendingParams {
  params: {
    organizationId: string
    id: string
  }
}

interface IGetPaymentsParams {
  organizationId: string
  isOffRampEnabled?: boolean
  params?: {
    search?: string
    page?: number | string
    size?: number | string
    direction?: string
    order?: string
    destinationAddresses?: string[]
    cryptocurrencies?: string[]
    statuses?: string[]
    providerStatuses?: string[]
    chartOfAccountIds?: string[]
    reviewerIds?: string[]
    startDate?: string
    endDate?: string
    destinationCurrencyType?: CurrencyType
  }
}

interface IGetPaymentByIdParams {
  organizationId: string
  id: string
}

export interface IPayment {
  id: string
  status: PaymentStatus
  blockchainId: string
  safeHash: string
  destinationAddress: string
  destinationCurrency: any
  sourceCryptocurrency: any
  sourceAmount: string
  destinationCurrencyType: CurrencyType
  destinationAmount: string
  metadata: { [key: string]: any }
  destinationName: string | null
  destinationMetadata: {
    id: string
    type: string
    bankName?: string
    accountNumberLast4?: string
  } | null
  // cryptocurrency: any
  // amount: string
  chartOfAccount: {
    id: string
    name: string
    code: string
  }
  files: any[]
  notes: string
  createdAt: string
  createdBy: {
    name: string
  }
  failedAt: string
  reviewedAt: string
  reviewedBy: {
    name: string
  }
  providerStatus: string
  executedAt: string
  executedBy: {
    name: string
  }
  updatedAt: string
  reviewRequestedAt: string
  reviewRequestedBy: {
    name: string
  }
  reviewer?: {
    account: {
      name: string
    }
    id: string
  }
  sourceWallet?: { name: string; address: string }
  annotations?: IAnnotation[]
}

interface IBulkDeletePaymentsParams {
  params: {
    organizationId: string
  }
  body: {
    data: string[]
  }
}

interface IBulkSubmitForReviewParams {
  params: {
    organizationId: string
  }
  body: {
    reviewerId: string
    data: IUpdatePaymentBody[]
  }
}

interface IGetQuoteParams {
  id: string
  organizationId: string
}

type IBulkSetForReviewParams = IBulkDeletePaymentsParams

const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayment: builder.query<IPagination<IPayment>, IGetPaymentsParams>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/payments`,
        method: 'GET',
        params
      }),
      transformResponse: (res, request, params) => {
        if (params?.isOffRampEnabled) {
          return res.data
        }
        return {
          ...res.data,
          items: res?.data?.items?.map((i) => ({
            ...i,
            destinationAmount: i.amount ?? i?.destinationAmount,
            destinationCurrency: i.cryptocurrency ?? i?.destinationCurrency,
            destinationCurrencyType: 'crypto'
          }))
        }
      },
      providesTags: ['draft-transactions']
    }),
    getPaymentById: builder.query<any, IGetPaymentByIdParams>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/payments/${id}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['draft-transactions']
    }),
    getPaymentRecipients: builder.query<any, { organizationId: string; params?: any }>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/payments/recipients`,
        method: 'GET',
        params
      }),
      transformResponse: (res) => res.data,
      providesTags: ['draft-transactions']
    }),
    updatePayment: builder.mutation<any, IUpdatePaymentParams>({
      query: ({ params, body }) => ({
        url: `${params?.organizationId}/payments/${params?.paymentId}`,
        body,
        method: 'POST'
      }),
      transformResponse: (res, request, params) => {
        if (params?.isOffRampEnabled) {
          return res.data
        }
        return {
          ...res.data,
          destinationAmount: res.data?.amount ?? res.data?.destinationAmount,
          destinationCurrency: res.data?.cryptocurrency ?? res.data?.destinationCurrency,
          destinationCurrencyType: 'crypto'
        }
      },
      invalidatesTags: ['draft-transactions']
    }),
    postPayments: builder.mutation<any, ISubmitPaymentParams>({
      query: ({ params, body }) => ({
        url: `${params?.organizationId}/payments`,
        body,
        method: 'POST'
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['draft-transactions']
    }),
    updatePaymentStatusToExecuting: builder.mutation<any, ISetPaymentAsExecutingParams>({
      query: ({ params, body }) => ({
        url: `${params?.organizationId}/payments/set-executing`,
        body,
        method: 'POST'
      }),
      invalidatesTags: ['transactions', 'draft-transactions']
    }),
    updatePaymentStatusToExecuted: builder.mutation<any, ISetPaymentAsExecutedParams>({
      query: ({ params, body }) => ({
        url: `${params?.organizationId}/payments/set-executed`,
        body,
        method: 'POST'
      }),
      invalidatesTags: ['transactions', 'draft-transactions']
    }),
    updatePaymentStatusToCreated: builder.mutation<any, any>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/payments/${id}/set-created`,
        method: 'POST'
      }),
      invalidatesTags: ['draft-transactions']
    }),
    updatePaymentStatusToApproved: builder.mutation<any, any>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/payments/${id}/set-approved`,
        method: 'POST'
      }),
      invalidatesTags: ['draft-transactions']
    }),
    deletePayment: builder.mutation<any, IDeletePaymentParams>({
      query: ({ params }) => ({
        url: `${params?.organizationId}/payments/${params?.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['draft-transactions']
    }),
    updatePaymentStatusToFailed: builder.mutation<any, ISetPaymentAsFailedParams>({
      query: ({ params, body }) => ({
        url: `${params?.organizationId}/payments/set-failed`,
        body,
        method: 'POST'
      }),
      invalidatesTags: ['draft-transactions']
    }),
    getQuote: builder.mutation<any, IGetQuoteParams>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/payments/${id}/get-quote`,
        method: 'POST'
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['draft-transactions']
    }),
    updatePaymentStatusToPending: builder.mutation<any, ISetPaymentAsPendingParams>({
      query: ({ params }) => ({
        url: `${params?.organizationId}/payments/${params?.id}/set-pending`,
        method: 'POST'
      }),
      invalidatesTags: ['draft-transactions']
    }),
    downloadPaymentFile: builder.query<any, { organizationId: string; id: string; fileId: string; fileName: string }>({
      queryFn: async ({ organizationId, id, fileName, fileId }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${organizationId}/payments/${id}/files/${fileId}`,
          method: 'GET',
          responseHandler: (response) => {
            return response.blob()
          }
        })

        const hiddenElement = document.createElement('a')
        const url = window.URL || window.webkitURL
        const blobPDF = url.createObjectURL(result.data)
        hiddenElement.href = blobPDF
        hiddenElement.target = '_blank'
        hiddenElement.download = fileName
        hiddenElement.click()
        return { data: null }
      }
    }),
    fakeBulkDeletePayments: builder.mutation<any, IBulkDeletePaymentsParams>({
      queryFn: async ({ params, body }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(body?.data, 2)
        const errorDetails = []
        for (const batchCall of batchCalls) {
          const responses = await Promise.all(
            batchCall.map((id) =>
              baseQuery({
                url: `${params?.organizationId}/payments/${id}`,
                method: 'DELETE'
              })
            )
          )
          responses.forEach((res, index) => {
            if (res.error) {
              errorDetails.push({ id: batchCall[index], error: res.error })
            }
          })
        }

        if (errorDetails.length > 0) {
          // Handle different types of errors differently if needed
          const allUnhandledServerErrors = errorDetails.every((err) => err.error.status === 500)
          const message = allUnhandledServerErrors
            ? 'Sorry, an unexpected error occurred'
            : `${errorDetails.length} payment${errorDetails?.length > 1 ? 's' : ''} couldn't be deleted`

          return {
            data: null,
            error: { message, failedItems: errorDetails.map((item) => item.id) },
            isSuccess: false,
            isError: true
          }
        }

        return { data: null } // Success case
      },
      invalidatesTags: ['draft-transactions']
    }),
    fakeBulkUpdateReviewer: builder.mutation<any, IBulkSubmitForReviewParams>({
      queryFn: async ({ params, body }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(body?.data, 2)
        const errorDetails = []
        for (const batchCall of batchCalls) {
          const responses = await Promise.all(
            batchCall.map((payment: IUpdatePaymentBody) =>
              baseQuery({
                url: `${params?.organizationId}/payments/${payment?.id}`,
                body: {
                  reviewerId: body?.reviewerId,
                  woo: 'yaaa',
                  ...payment
                },
                method: 'POST'
              })
            )
          )
          responses.forEach((res, index) => {
            if (res.error) {
              errorDetails.push({ id: batchCall[index], error: res.error })
            }
          })
        }

        if (errorDetails.length > 0) {
          // Handle different types of errors differently if needed
          const allUnhandledServerErrors = errorDetails.every((err) => err.error.status === 500)
          const message = allUnhandledServerErrors
            ? 'Sorry, an unexpected error occurred'
            : `${errorDetails.length} payments couldnt update reviewer`

          return {
            data: null,
            error: { message, failedItems: errorDetails.map((item) => item.id) },
            isSuccess: false,
            isError: true
          }
        }

        return { data: null } // Success case
      },
      invalidatesTags: ['draft-transactions']
    }),
    fakeBulkSetCreated: builder.mutation<any, IBulkSetForReviewParams>({
      queryFn: async ({ params, body }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(body?.data, 2)
        const errorDetails = []
        for (const batchCall of batchCalls) {
          const responses = await Promise.all(
            batchCall.map((id) =>
              baseQuery({
                url: `${params?.organizationId}/payments/${id}/set-created`,
                method: 'POST'
              })
            )
          )
          responses.forEach((res, index) => {
            if (res.error) {
              errorDetails.push({ id: batchCall[index], error: res.error })
            }
          })
        }

        if (errorDetails.length > 0) {
          // Handle different types of errors differently if needed
          const allUnhandledServerErrors = errorDetails.every((err) => err.error.status === 500)
          const message = allUnhandledServerErrors
            ? 'Sorry, an unexpected error occurred'
            : `${errorDetails.length} payment${errorDetails?.length > 1 ? 's' : ''} couldn't be submitted for review`

          return {
            data: null,
            error: { message, failedItems: errorDetails.map((item) => item.id) },
            isSuccess: false,
            isError: true
          }
        }

        return { data: null } // Success case
      },
      invalidatesTags: ['draft-transactions']
    }),
    fakeBulkSetApproved: builder.mutation<any, IBulkSetForReviewParams>({
      queryFn: async ({ params, body }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(body?.data, 2)
        const errorDetails = []
        for (const batchCall of batchCalls) {
          const responses = await Promise.all(
            batchCall.map((id) =>
              baseQuery({
                url: `${params?.organizationId}/payments/${id}/set-approved`,
                method: 'POST'
              })
            )
          )
          responses.forEach((res, index) => {
            if (res.error) {
              errorDetails.push({ id: batchCall[index], error: res.error })
            }
          })
        }

        if (errorDetails.length > 0) {
          // Handle different types of errors differently if needed
          const allUnhandledServerErrors = errorDetails.every((err) => err.error.status === 500)
          const message = allUnhandledServerErrors
            ? 'Sorry, an unexpected error occurred'
            : `${errorDetails.length} payment${errorDetails?.length > 1 ? 's' : ''} couldn't be submitted for review`

          return {
            data: null,
            error: { message, failedItems: errorDetails.map((item) => item.id) },
            isSuccess: false,
            isError: true
          }
        }

        return { data: null } // Success case
      },
      invalidatesTags: ['draft-transactions']
    }),
    fakeBulkSetPending: builder.mutation<any, IBulkSetForReviewParams>({
      queryFn: async ({ params, body }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(body?.data, 2)
        const errorDetails = []
        for (const batchCall of batchCalls) {
          const responses = await Promise.all(
            batchCall.map((id) =>
              baseQuery({
                url: `${params?.organizationId}/payments/${id}/set-pending`,
                method: 'POST'
              })
            )
          )
          responses.forEach((res, index) => {
            if (res.error) {
              errorDetails.push({ id: batchCall[index], error: res.error })
            }
          })
        }

        if (errorDetails.length > 0) {
          // Handle different types of errors differently if needed
          const allUnhandledServerErrors = errorDetails.every((err) => err.error.status === 500)
          const message = allUnhandledServerErrors
            ? 'Sorry, an unexpected error occurred'
            : `${errorDetails.length} payment${errorDetails?.length > 1 ? 's' : ''} couldn't be submitted for review`

          return {
            data: null,
            error: { message, failedItems: errorDetails.map((item) => item.id) },
            isSuccess: false,
            isError: true
          }
        }

        return { data: null } // Success case
      },
      invalidatesTags: ['draft-transactions']
    })
  })
})

export const {
  useGetPaymentQuery,
  useLazyGetPaymentByIdQuery,
  usePostPaymentsMutation,
  useUpdatePaymentStatusToExecutingMutation,
  useUpdatePaymentStatusToExecutedMutation,
  useUpdatePaymentStatusToFailedMutation,
  useUpdatePaymentStatusToPendingMutation,
  useUpdatePaymentStatusToApprovedMutation,
  useUpdatePaymentStatusToCreatedMutation,
  useLazyDownloadPaymentFileQuery,
  useGetPaymentRecipientsQuery,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useFakeBulkDeletePaymentsMutation,
  useFakeBulkSetApprovedMutation,
  useFakeBulkUpdateReviewerMutation,
  useFakeBulkSetCreatedMutation,
  useFakeBulkSetPendingMutation,
  useGetQuoteMutation
} = paymentApi
