/* eslint-disable guard-for-in */
/* eslint-disable arrow-body-style */
import { format } from 'date-fns'
import { api } from './index'
import { chunk } from 'lodash'
import { IntegrationName } from './organization-integrations'
import { ReportInterval } from '@/views/Transactions-v2/GenerateReportModal/interface'
import { IAnnotation } from '@/slice/tags/tag-type'

type SubStatus = 'missing_cost_basis' | 'missing_price'

const countRowsInCSV = async (csvFile: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()

      reader.onload = (event: any) => {
        const cvsData = event.target.result
        const rowData = cvsData.split('\n')
        resolve(rowData.length)
      }

      reader.readAsText(csvFile)
    } catch (error: any) {
      reject(error)
    }
  })
}

export enum TxActivity {
  TRANSFER = 'transfer',
  SWAP = 'swap',
  CONTRACT_INTERACTION = 'contract_interaction',
  WRAP = 'wrap',
  UNWRAP = 'unwrap'
  // OFF_RAMP = 'off_ramp',
  // ON_RAMP = 'on_ramp',
  // MINT = 'mint',
  // BURN = 'burn'
}

export enum TxType {
  // Direction = incoming
  DEPOSIT = 'deposit',
  DEPOSIT_INTERNAL = 'deposit_internal',
  DEPOSIT_GROUP = 'deposit_group',

  // Direction = outgoing
  FEE = 'fee',
  WITHDRAWAL = 'withdrawal',
  WITHDRAWAL_INTERNAL = 'withdrawal_internal',
  WITHDRAWAL_GROUP = 'withdrawal_group'
}

enum FinancialTransactionExportStatus {
  UNEXPORTED = 'unexported',
  EXPORTING = 'exporting',
  EXPORTED = 'exported',
  FAILED_TO_GENERATE = 'failed_to_generate'
}

export interface ITxFitlerParams {
  walletAddresses?: string[]
  startTime?: Date | string
  endTime?: Date | string
  activities?: TxActivity[]
  childTypes?: TxType[]
  fromAddresses?: string[]
  toAddresses?: string[]
  annotations?: string[]
  assetIds?: string[]
  categories?: 'uncategorized' | string[]
  correspondingChartOfAccountIds?: 'null' | string[]
  fromFiatAmount?: string
  toFiatAmount?: string
  blockchainIds?: string[]
  exportStatuses?: string[]
  invoices?: string[]
}
export interface ITabStatusParams extends ITxFitlerParams {
  substatuses?: SubStatus[]
  childStatuses?: 'ignored' | ''
  search?: string
  blockchainIds?: any
  size?: number
  exportStatuses?: string[]
  invoices?: string[]
}
interface IPaginated {
  currentPage: number
  limit: number
  totalItems: number
  totalPages: number
}

interface IFinancialTxParent {
  activity: string
  chainId: string
  childCount: number
  hash: string
  status: string
  valueTimestamp: string
}

interface IFinancialTxContact {
  addresses: {
    address: string
    chainId: number
  }[]
  name: string
  organizationId: string
  type: string
  typeId: string
}

interface ICryptoCurrency {
  addresses: {
    address: null | string
    chainId: number
    decimal: number
    type: string
  }[]
  image: {
    large: string
    small: string
    thumb: string
  }
  name: string
  publicId: string
  symbol: string
}

type IAccount = {
  code: string
  description: string
  id: string
  name: string
  status: string
  type: string
}

interface IFinancialTx {
  id: string
  chainId: number
  costBasis: string
  cryptoCurrency: ICryptoCurrency
  cryptoCurrencyAmount: string
  fiatAmount: string
  fiatAmountPerUnit: string
  financialTransactionParent: IFinancialTxParent
  fromAddress: string
  fromContact: IFinancialTxContact
  gainLoss: string
  hash: string
  publicId: string
  status: string
  substatuses: any
  toAddress: string
  toContact: IFinancialTxContact
  type: string
  valueTimestamp: string
  category: any
  note: string
  correspondingChartOfAccount: IAccount | null
  annotations: IAnnotation[]
}

interface IUpdateFinancialTx {
  orgId: string
  id: string
  page?: number
  filterParams?: ITabStatusParams
  optimisticAccount?: { id: string; name: string; code: string }
  payload: {
    categoryId?: string
    correspondingChartOfAccountId?: string
    categoryName?: string
    status?: any
    amount?: number
    amountPerUnit?: number
    costBasis?: number
    note?: string
  }
}

interface ICreateJournalEntry {
  organizationId: string
  body: { integrationName: string; type: string; financialTransactionParentIds: any; queryParams?: any }
}

interface IListTx extends IPaginated {
  items: IFinancialTx[]
}

export interface IFiles {
  id: string
  name: string
  size: number
  mimeType: string
}

interface IBankFeedExportBody {
  integrationName: IntegrationName
  startTime: Date
  endTime: Date
  walletId: string
  cryptocurrencyIds: string[]
  blockchainId: string
  fileType?: string
}
interface IReportExportBody {
  interval: ReportInterval
  startDate: string | Date
  endDate: string | Date
  walletIds?: string[]
  cryptocurrencyIds?: string[]
  blockchainIds?: string[]
  fileType?: string
}
interface IAttachAnnotation {
  organizationId: string
  childId: string
  annotationId: string
  page: number
  filterParams: any
  tagName: string
}

interface IDeleteAnnotation {
  organizationId: string
  childId: string
  annotationId: string
  page: number
  filterParams: any
}

export const transactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialTransactions: builder.query<IListTx, { orgId: string; page?: number; params?: ITabStatusParams }>({
      query: ({ orgId, page, params }) => ({
        url: `${orgId}/financial-transactions`,
        method: 'GET',
        params: { page, ...params }
      }),
      transformResponse: (res) => res.data,
      providesTags: ['transactions']
    }),
    getFinancialTransaction: builder.query<IListTx, { orgId: string; id: any; parentHash: any }>({
      query: ({ orgId, id, parentHash }) => ({
        url: `${orgId}/financial-transactions/${id}/parent/${parentHash}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: (result, error, arg) => [{ type: 'transaction-details', id: arg.id }]
    }),
    getFinancialTransactionDefaultMapping: builder.query<any, { orgId: string; id: any }>({
      query: ({ orgId, id }) => ({
        url: `${orgId}/financial-transactions/${id}/default-chart-of-account-mapping`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data
    }),
    getFinancialTransactionTaxLots: builder.query<any, { orgId: string; id: any }>({
      query: ({ orgId, id }) => ({
        url: `${orgId}/financial-transactions/${id}/tax-lot-sales`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: (result, error, arg) => [{ type: 'transaction-details', id: arg.id }]
    }),
    journalEntryExports: builder.query<any, any>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/journal-entry-exports`,
        method: 'GET',
        params
      }),
      transformResponse: (res) => res.data,
      providesTags: ['journal-entry-exports']
    }),
    getPendingTransactions: builder.query<IListTx, { orgId: string; params?: ITabStatusParams }>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/financial-transactions/pending`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (res) => res.data,
      providesTags: ['transactions']
    }),

    updateFinancialTransaction: builder.mutation<any, IUpdateFinancialTx>({
      query: ({ orgId, id, payload }) => ({
        url: `${orgId}/financial-transactions/${id}`,
        method: 'PUT',
        body: payload
      }),
      // invalidatesTags: ['transactions', {type: "transaction-details", id: }]
      invalidatesTags: (result, error, arg) => [
        'transactions',
        { type: 'transaction-details', id: arg.id },
        'wallets',
        'chart-of-accounts-count'
      ],
      async onQueryStarted(
        { orgId, id, page, filterParams, payload, optimisticAccount },
        { dispatch, queryFulfilled }
      ) {
        const transactionsPatchResult = dispatch(
          transactionsApi.util.updateQueryData(
            'getFinancialTransactions',
            { orgId, page, params: filterParams ? { ...filterParams } : undefined },
            (draft) => {
              const transaction = draft.items.find((txn) => txn.id === id)

              if (transaction) {
                if (payload.correspondingChartOfAccountId !== undefined) {
                  transaction.correspondingChartOfAccount = {
                    ...transaction.correspondingChartOfAccount,
                    id: optimisticAccount?.id ?? '',
                    name: optimisticAccount?.name ?? '',
                    code: optimisticAccount?.code ?? ''
                  }
                }
              }
            }
          )
        )
        try {
          await queryFulfilled
        } catch {
          transactionsPatchResult.undo()
        }
      }
    }),
    updateParentFinancialTransaction: builder.mutation<IListTx, { orgId: string; id: any; parentHash: any; body: any }>(
      {
        query: ({ orgId, id, parentHash, body }) => ({
          url: `${orgId}/financial-transactions/${id}/parent/${parentHash}`,
          method: 'PUT',
          body
        }),
        transformResponse: (res) => res.data,
        invalidatesTags: (result, error, arg) => [{ type: 'transaction-details', id: arg.id }]
      }
    ),
    getTransactionFiles: builder.query<IFiles[], { orgId: string; id: any }>({
      query: ({ orgId, id }) => ({
        url: `${orgId}/financial-transactions/${id}/files`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['files']
    }),

    uploadFile: builder.mutation<any, { orgId: string; id: string; files: FormData }>({
      query: ({ orgId, id, files }) => {
        return {
          url: `${orgId}/financial-transactions/${id}/files/upload`,
          method: 'POST',
          body: files,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      },
      invalidatesTags: ['files']
    }),
    journayEntryExportCreate: builder.mutation<any, ICreateJournalEntry>({
      query: ({ organizationId, body }) => {
        return {
          url: `${organizationId}/journal-entry-exports`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['journal-entry-exports']
    }),

    deleteJournalEntry: builder.mutation<any, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => {
        return {
          url: `${organizationId}/journal-entry-exports/${id}/abort`,
          method: 'POST'
        }
      },
      invalidatesTags: ['journal-entry-exports']
    }),

    deleteFile: builder.mutation<any, { orgId: string; id: string; fileId: string }>({
      query: ({ orgId, id, fileId }) => {
        return {
          url: `${orgId}/financial-transactions/${id}/files/${fileId}`,
          method: 'DELETE'
        }
      },
      invalidatesTags: ['files']
    }),
    exportJournalEntry: builder.mutation<any, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => {
        return {
          url: `${organizationId}/journal-entry-exports/${id}/export`,
          method: 'POST'
        }
      },
      invalidatesTags: ['journal-entry-exports']
    }),

    downloadFile: builder.query<any, any>({
      queryFn: async ({ orgId, id, fileId, fileName }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${orgId}/financial-transactions/${id}/files/${fileId}/download`,
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

        // triggerDownload(result, fileName) // this also doesn't get called
        return { data: null }
      }
    }),
    previewFileTab: builder.query<any, any>({
      queryFn: async ({ orgId, id, fileId, fileName }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${orgId}/financial-transactions/${id}/files/${fileId}/download`,
          method: 'GET',
          responseHandler: (response) => {
            return response.blob()
          }
        })

        const hiddenElement = document.createElement('a')
        const blobURL = window.URL.createObjectURL(result.data)
        hiddenElement.href = blobURL
        hiddenElement.target = '_blank'
        hiddenElement.click()

        return { data: null }
      }
    }),

    // ------------------------------------ NEW CSV ENDPOINTS FOR EXPORTS --------------------------------------
    getCSVExports: builder.query<any, any>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/financial-transaction-exports`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['csv-exports']
    }),

    downloadCSVFile: builder.query<any, any>({
      queryFn: async ({ orgId, id, fileName }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${orgId}/financial-transaction-exports/${id}/download`,
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

    generateAllCSVExports: builder.mutation<any, any>({
      query: ({ organizationId, body }) => {
        return {
          url: `${organizationId}/financial-transaction-exports`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['csv-exports']
    }),
    // ----------------------------------------------------------------------------------------------------------------
    getBankFeedExports: builder.query<any, any>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/bank-feed-exports`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['bank-feed-exports']
    }),

    downloadBankFeedExport: builder.query<any, any>({
      queryFn: async ({ orgId, id, fileName }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${orgId}/bank-feed-exports/${id}/download`,
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

    generateBankFeedExports: builder.mutation<any, { organizationId: string; body: IBankFeedExportBody }>({
      query: ({ organizationId, body }) => {
        return {
          url: `${organizationId}/bank-feed-exports`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['bank-feed-exports']
    }),

    getReportExports: builder.query<any, { organizationId: string; types?: string[]; size?: number }>({
      query: ({ organizationId, types, size }) => ({
        url: `${organizationId}/export-workflows`,
        method: 'GET',
        params: {
          types,
          size
        }
      }),
      transformResponse: (res) => res.data,
      providesTags: ['balance-reports']
    }),
    downloadReportExport: builder.query<any, any>({
      queryFn: async ({ orgId, id, fileName }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${orgId}/export-workflows/${id}/download`,
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
    generateReportExports: builder.mutation<any, { organizationId: string; body: IReportExportBody }>({
      query: ({ organizationId, body }) => {
        return {
          url: `${organizationId}/export-workflows/spot-balance`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['balance-reports']
    }),
    exportCSVFile: builder.query<any, any>({
      queryFn: async ({ orgId, orgName, params }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${orgId}/financial-transactions/all/export`,
          method: 'GET',
          params,
          responseHandler: (response) => response.blob()
        })

        let numberOfRows = 0
        try {
          numberOfRows = await countRowsInCSV(result.data)
        } catch (err) {
          console.log('CSV Reader Error', err)
        }

        const hiddenElement = document.createElement('a')
        const url = window.URL || window.webkitURL
        const blobPDF = url.createObjectURL(result.data)
        hiddenElement.href = blobPDF
        hiddenElement.target = '_blank'
        hiddenElement.download = `${orgName}_txns_${format(new Date(), 'dd-MM-yyyy')}.csv`
        hiddenElement.click()
        return {
          data: {
            count: numberOfRows
          }
        }
      }
    }),
    fakeBulkUpdateFinancialTx: builder.mutation<any, any>({
      queryFn: async ({ orgId, data }, _api, _extraOptions, baseQuery) => {
        const batchCalls = chunk(data, 2)
        let numberOfErrors = 0
        for (const batchCall of batchCalls) {
          const response = await Promise.all(
            batchCall.map((_tx: any) =>
              baseQuery({
                url: `${orgId}/financial-transactions/${_tx.id}`,
                method: 'PUT',
                body: _tx.data
              })
            )
          )
          // eslint-disable-next-line no-loop-func
          response.forEach((res) => {
            if (res.error) {
              numberOfErrors++
            }
          })
        }
        return numberOfErrors
          ? { data: null, error: `${numberOfErrors} transactions can't be updated` }
          : { data: null }
      },
      invalidatesTags: ['transactions', 'wallets'],
      async onQueryStarted({ orgId, data, page, filterParams }, { dispatch, queryFulfilled }) {
        const transactionsPatchResult = dispatch(
          transactionsApi.util.updateQueryData(
            'getFinancialTransactions',
            { orgId, page, params: filterParams ? { ...filterParams } : undefined },
            (draft) => {
              const parsedTx = {}
              data.forEach((item) => {
                parsedTx[item.id] = { ...item.data }
              })
              const transactions = draft.items.filter((txn) => Object.keys(parsedTx).includes(txn.id))
              if (transactions.length) {
                transactions.forEach((transaction) => {
                  if (parsedTx[transaction.id].correspondingChartOfAccountId !== undefined) {
                    transaction.correspondingChartOfAccount =
                      parsedTx[transaction.id].correspondingChartOfAccountId === null
                        ? { ...transaction.correspondingChartOfAccount, id: '', name: '', code: '' }
                        : {
                            ...transaction.correspondingChartOfAccount,
                            id: parsedTx[transaction.id].correspondingChartOfAccountId,
                            name: parsedTx[transaction.id].correspondingChartOfAccountName,
                            code: parsedTx[transaction.id].correspondingChartOfAccountCode
                          }
                  }
                })
              }
            }
          )
        )
        try {
          await queryFulfilled
        } catch {
          transactionsPatchResult.undo()
        }
      }
    }),
    attachAnnotation: builder.mutation<any, IAttachAnnotation>({
      query: ({ organizationId, childId, annotationId, tagName }) => ({
        url: `${organizationId}/financial-transactions/${childId}/annotations`,
        method: 'POST',
        body: {
          annotationId
        }
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: (result, error, arg) => [{ type: 'transaction-details', id: arg.childId }, 'transactions'],
      async onQueryStarted(
        { organizationId, childId, annotationId, page, filterParams, tagName },
        { dispatch, queryFulfilled }
      ) {
        const transactionsPatchResult = dispatch(
          transactionsApi.util.updateQueryData(
            'getFinancialTransactions',
            { orgId: organizationId, page, params: filterParams ? { ...filterParams } : undefined },
            (draft) => {
              const transaction = draft.items.find((txn) => txn.id === childId)

              if (transaction) {
                if (annotationId) {
                  const annotations = transaction?.annotations || []
                  transaction.annotations = [...annotations, { id: annotationId, name: tagName, type: 'tags' }]
                }
              }
            }
          )
        )
        try {
          await queryFulfilled
        } catch {
          transactionsPatchResult.undo()
        }
      }
    }),
    deleteAnnotation: builder.mutation<any, IDeleteAnnotation>({
      query: ({ organizationId, childId, annotationId }) => ({
        url: `${organizationId}/financial-transactions/${childId}/annotations/${annotationId}`,
        method: 'DELETE'
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: (result, error, arg) => [{ type: 'transaction-details', id: arg.childId }, 'transactions'],
      async onQueryStarted(
        { organizationId, childId, annotationId, page, filterParams },
        { dispatch, queryFulfilled }
      ) {
        const transactionsPatchResult = dispatch(
          transactionsApi.util.updateQueryData(
            'getFinancialTransactions',
            { orgId: organizationId, page, params: filterParams ? { ...filterParams } : undefined },
            (draft) => {
              const transaction = draft.items.find((txn) => txn.id === childId)

              if (transaction) {
                if (annotationId) {
                  const annotations = transaction?.annotations || []

                  transaction.annotations = annotations.filter((_tag) => _tag.id !== annotationId)
                }
              }
            }
          )
        )
        try {
          await queryFulfilled
        } catch {
          transactionsPatchResult.undo()
        }
      }
    })
  })
})

export const {
  useGetFinancialTransactionTaxLotsQuery,
  useLazyGetFinancialTransactionTaxLotsQuery,
  useGetFinancialTransactionsQuery,
  useLazyGetFinancialTransactionQuery,
  useLazyGetFinancialTransactionsQuery,
  useGetPendingTransactionsQuery,
  useLazyGetPendingTransactionsQuery,
  useLazyGetTransactionFilesQuery,
  useLazyExportCSVFileQuery,
  useUpdateFinancialTransactionMutation,
  useFakeBulkUpdateFinancialTxMutation,
  useUploadFileMutation,
  useLazyDownloadFileQuery,
  useLazyPreviewFileTabQuery,
  useDeleteFileMutation,
  useJournalEntryExportsQuery,
  useJournayEntryExportCreateMutation,
  useDeleteJournalEntryMutation,
  useExportJournalEntryMutation,
  useUpdateParentFinancialTransactionMutation,
  useGetCSVExportsQuery,
  useGenerateAllCSVExportsMutation,
  useLazyDownloadCSVFileQuery,
  useGetBankFeedExportsQuery,
  useGenerateBankFeedExportsMutation,
  useLazyDownloadBankFeedExportQuery,
  useGetReportExportsQuery,
  useGenerateReportExportsMutation,
  useLazyDownloadReportExportQuery,
  useLazyGetFinancialTransactionDefaultMappingQuery,
  useAttachAnnotationMutation,
  useDeleteAnnotationMutation
} = transactionsApi
