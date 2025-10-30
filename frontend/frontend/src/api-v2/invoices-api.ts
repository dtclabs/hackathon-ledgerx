import { api } from './index'
import { IPaginated, IPagaintedParams } from '@/slice/slice-global.types'
import { IInvoice, IInvoiceItem } from '@/slice/invoices/invoice.types'

export type IPaginatedListInvoices<T> = {
  data: IPaginated & {
    items: T[]
  }
}

export type IPaginatedListInvoiceParams = IPagaintedParams & {
  organizationId: string
}

interface ICancelInvoiceParams {
  organizationId: string
  id: string
}

interface ICreateInvoiceParams {
  organizationId: string
  body: {
    source: string
    invoiceNumber: string
    currency: string
    totalAmount: string
    issuedAt: string
    expiredAt: string
    note: string
    invoiceDetails: {
      subtotal: string
      taxTotal: string
      items: IInvoiceItem[]
    }
    fromMetadata: {
      name: string
      email?: string
      address?: string
    }
    toMetadata: {
      name: string
      email?: string
      address?: string
    }
  }
}

interface IGenerateQrPublic {
  organizationId: string
  invoiceId: string
  body: {
    channelId: number
  }
}

const invoicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    syncInvoices: builder.mutation<any, { orgId: string }>({
      query: ({ orgId }) => ({
        url: `${orgId}/invoices/sync`,
        method: 'POST'
      }),
      invalidatesTags: ['transactions']
    }),
    refreshFromSource: builder.mutation<any, { orgId: string; id: string }>({
      query: ({ orgId, id }) => ({
        url: `${orgId}/invoices/${id}/refreshFromSource`,
        method: 'POST'
      }),
      invalidatesTags: ['transactions', 'transaction-details', 'invoices']
    }),
    getInvoices: builder.query<IPaginatedListInvoices<IInvoice>, IPaginatedListInvoiceParams>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/invoices`,
        method: 'GET',
        params
      }),
      providesTags: ['invoices']
    }),
    createInvoice: builder.mutation<any, ICreateInvoiceParams>({
      query: ({ organizationId, body }) => ({
        url: `${organizationId}/invoices`,
        method: 'POST',
        body: {
          ...body
        }
      }),
      invalidatesTags: ['invoices']
    }),
    cancelInvoice: builder.mutation<any, ICancelInvoiceParams>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/invoices/${id}/cancel`,
        method: 'POST'
      }),
      invalidatesTags: ['invoices']
    }),
    getInvoice: builder.query<any, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/invoices/${id}`,
        method: 'GET'
      })
    }),
    getInvoicePublic: builder.query<any, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/invoices/${id}/public`,
        method: 'GET'
      }),
      providesTags: ['invoices']
    }),
    getInvoicePublicQr: builder.mutation<any, IGenerateQrPublic>({
      query: ({ organizationId, invoiceId, body }) => ({
        url: `${organizationId}/invoices/${invoiceId}/public/generate-qr`,
        method: 'POST',
        body: {
          id: body.channelId
        }
      }),
      invalidatesTags: ['invoices']
    }),
    globalSyncDtcpay: builder.mutation<any, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/invoices/sync/dtcpay`,
        method: 'POST'
      }),
      invalidatesTags: ['invoices']
    })
  })
})

export const {
  useSyncInvoicesMutation,
  useRefreshFromSourceMutation,
  useGetInvoiceQuery,
  useGetInvoicesQuery,
  useGetInvoicePublicQrMutation,
  useGetInvoicePublicQuery,
  useLazyGetInvoiceQuery,
  useCreateInvoiceMutation,
  useCancelInvoiceMutation,
  useGlobalSyncDtcpayMutation
} = invoicesApi
