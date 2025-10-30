/* eslint-disable arrow-body-style */
import { IPagination } from '@/api/interface'
import { api } from './index'

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REJECTED = 'rejected'
}

export interface IPayment {
  id: string
  paidAt: string
  status: PaymentStatus
  paidAmount: string
  billedAmount: string
  paymentMethod: string
  subscriptionDetails: {
    planName: string
    billingCycle: string
  }
  invoiceMetadata: {
    invoiceNumber: string
    s3Filename: string
  }
}

const billingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBillingHistories: builder.query<IPagination<IPayment>, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/billing-histories`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data
    }),

    downloadBillingInvoice: builder.query<any, { organizationId: string; id: string; fileName: string }>({
      queryFn: async ({ organizationId, id, fileName }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${organizationId}/billing-histories/${id}/invoice`,
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
    })
  })
})

export const { useGetBillingHistoriesQuery, useLazyDownloadBillingInvoiceQuery } = billingApi
