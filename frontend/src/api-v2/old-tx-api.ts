/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-param-reassign */

import { api } from './index'
import { IPagination } from '@/api/interface'
import { format } from 'date-fns'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { getTokenUsdPrice } from '@/utils/getTokenUsdPrice'
import { IToken } from '@/hooks/useNetwork'
import {
  ETransactionType,
  ICreateTransaction,
  IGetTransactionQuery,
  IGetTransactionXeroQuery,
  ISyncPayload,
  ITransaction
} from '@/slice/old-tx/interface'
import { useTransaction } from '@/hooks/useTransaction'
import { allowedMIMETypes } from '@/constants-v2/allowed-filetype'

interface IDownloadFileRequest {
  key: string
  filename: string
}

export interface IPreviewFileRequest {
  key: string
  filename: string
}

export const transactionCalculation = ({
  tokens,
  transaction,
  chainId,
  price
}: {
  tokens: IToken[]
  transaction: ITransaction
  chainId: number
  price: any
}) => {
  const token = tokens.find(
    (tokenItem) =>
      transaction.symbol && tokenItem.symbol && tokenItem.symbol.toLowerCase() === transaction.symbol.toLowerCase()
  )
  if (token) transaction.token = token
  const currentTokenPrice = getTokenUsdPrice({
    chainId: chainId || 4,
    price,
    tokenAdd: transaction.tokenAddress,
    tokens
  })
  transaction.gasUsed =
    (transaction.metamaskTransaction &&
      transaction.metamaskTransaction.gasUsed &&
      Number(transaction.metamaskTransaction.gasUsed)) ||
    (transaction.safeTransaction && transaction.safeTransaction.gasUsed)

  transaction.gasPrice =
    transaction.metamaskTransaction &&
    transaction.metamaskTransaction.gasPrice &&
    Number(transaction.metamaskTransaction.gasPrice)

  transaction.fee =
    (transaction.gasUsed &&
      transaction.gasPrice &&
      formatEther((transaction.gasPrice * transaction.gasUsed).toString())) ||
    (transaction.safeTransaction && transaction.safeTransaction.fee && formatEther(transaction.safeTransaction.fee))

  transaction.isExecuted =
    (transaction.metamaskTransaction && true) || (transaction.safeTransaction && transaction.safeTransaction.isExecuted)
  transaction.from =
    (transaction.metamaskTransaction && transaction.metamaskTransaction.from) ||
    (transaction.safeTransaction && (transaction.safeTransaction.from || transaction.safeTransaction.safe))
  transaction.to =
    (transaction.metamaskTransaction && transaction.metamaskTransaction.to) ||
    (transaction.safeTransaction && transaction.safeTransaction.to)

  if (transaction.recipients) {
    transaction.recipients = transaction.recipients.map((recipient) => ({
      ...recipient,
      currentUSDPrice: transaction.token && Number(recipient.amount) * Number(currentTokenPrice)
    }))

    transaction.amount = transaction.recipients.reduce(
      (prev, cur) =>
        (cur.cryptocurrencyAmount && formatEther(parseEther(cur.cryptocurrencyAmount).add(parseEther(prev)))) || prev,
      '0'
    )
    transaction.pastUSDPrice =
      transaction.token && transaction.recipients.reduce((prev, cur) => cur.pastUSDPrice && cur.pastUSDPrice + prev, 0)
    if (transaction.symbol === 'Unknown') {
      transaction.symbol = 'Unknown Token'
    }
    if (!transaction.recipients) {
      transaction.recipients.push({ address: transaction.to })
    }
    if (
      transaction.safeTransaction &&
      transaction.safeTransaction.value === '0' &&
      !transaction.safeTransaction.data &&
      !transaction.safeTransaction.dataDecoded
    ) {
      transaction.isRejectTransaction = true
    }
  }
}

const transactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<
      IPagination<ITransaction>,
      {
        organizationId: string
        price: any
        tokens?: IToken[]
        params?: IGetTransactionQuery
        getCurrentNonce?: (sourceId: string) => Promise<number>
      }
    >({
      queryFn: async ({ organizationId, price, tokens, params, getCurrentNonce }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${organizationId}/transactions/sources`,
          method: 'GET',
          params
        })
        const transactions = result.data.data

        if (transactions.items && transactions.items.length > 0 && price && tokens) {
          const { length } = transactions.items
          for (let i = 0; i < length; i++) {
            const transaction = transactions.items[i]
            transactionCalculation({ tokens, chainId: params.chainId, price, transaction })
            if (params.type === ETransactionType.INCOMING) {
              transaction.isIncoming = true
            }
          }
        }

        return result.data
      },
      providesTags: ['transactions']
    }),

    getQueueTransactions: builder.query<
      IPagination<ITransaction>,
      {
        organizationId: string
        price: any
        tokens?: IToken[]
        getCurrentNonce?: (sourceId: string) => Promise<number>
        params?: IGetTransactionQuery
      }
    >({
      queryFn: async ({ organizationId, price, tokens, params }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${organizationId}/transactions/sources`,
          method: 'GET',
          params
        })
        const { getCurrentNonce } = useTransaction()
        const transactions = result.data.data

        if (transactions.items && transactions.items.length > 0 && price && tokens) {
          const { length } = transactions.items
          for (let i = 0; i < length; i++) {
            const transaction = transactions.items[i]
            if (getCurrentNonce) {
              const currentNonce = await getCurrentNonce(transaction.source.id)
              transaction.currentNonce = currentNonce
              if (transaction.safeTransaction.nonce === currentNonce) {
                transaction.isReady = true
              } else {
                transaction.isReady = false
              }
            }
            transactionCalculation({ tokens, chainId: params.chainId, price, transaction })
          }
        }

        return result.data
      },
      providesTags: ['transactions']
    }),

    getXeroTransactions: builder.query<
      IPagination<ITransaction>,
      { organizationId: string; orgName: string; params?: IGetTransactionXeroQuery }
    >({
      queryFn: async ({ organizationId, orgName, params }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `${organizationId}/transactions/export`,
          method: 'GET',
          params: { ...params },
          responseHandler: (response) => response.blob()
        })

        const hiddenElement = document.createElement('a')
        const url = window.URL || window.webkitURL
        const blobPDF = url.createObjectURL(result.data)
        hiddenElement.href = blobPDF
        hiddenElement.target = '_blank'
        hiddenElement.download = `${orgName}_xero_txns_${format(new Date(), 'dd-MM-yyyy')}.csv`
        hiddenElement.click()
        return { data: null }
      }
    }),

    getListFilterAddresses: builder.query<any, { organizationId: string; chainId: number }>({
      query: ({ organizationId, chainId }) => ({
        url: `${organizationId}/transactions/filter/${chainId}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data
    }),

    postTransaction: builder.mutation<any, { organizationId: string; params?: ICreateTransaction }>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/temp-transactions`,
        method: 'POST',
        body: params
      }),
      invalidatesTags: ['transactions']
    }),

    updateTransaction: builder.mutation<any, { organizationId: string; id: string; params?: ICreateTransaction }>({
      query: ({ organizationId, id, params }) => ({
        url: `${organizationId}/transactions/${id}/info`,
        method: 'PUT',
        body: params
      }),
      invalidatesTags: (result, error, arg) => ['transactions', { type: 'transaction-details', id: arg.id }]
    }),

    syncTransaction: builder.mutation<any, { organizationId: string; params?: ISyncPayload }>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/transactions/sync`,
        method: 'POST',
        body: params
      }),
      invalidatesTags: ['transactions']
    }),

    uploadTxFile: builder.mutation<any, { files: any }>({
      query: ({ files }) => ({
        url: 'files',
        method: 'POST',
        body: files,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }),
      invalidatesTags: ['transactions']
    }),

    downloadTxFile: builder.query<any, IDownloadFileRequest>({
      queryFn: async ({ key, filename }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `files/${key}`,
          method: 'GET',
          responseHandler: (response) => response.blob()
        })

        const hiddenElement = document.createElement('a')
        const url = window.URL || window.webkitURL
        const blobPDF = url.createObjectURL(result.data)
        hiddenElement.href = blobPDF
        hiddenElement.target = '_blank'
        hiddenElement.download = filename
        hiddenElement.click()
        return { data: null }
      }
    }),
    previewFile: builder.query<any, IPreviewFileRequest>({
      queryFn: async ({ key, filename }, _api, _extraOptions, baseQuery) => {
        console.log('key', key)
        console.log('filename', filename)
        const result = await baseQuery({
          url: `files/${key}`,
          method: 'GET',
          responseHandler: (response) => response.blob()
        })

        const file = result.data
        const fileType = filename.split('.').pop()
        const hiddenElement = document.createElement('a')
        const blobURL = window.URL.createObjectURL(file.slice(0, file.size, allowedMIMETypes[fileType]))

        hiddenElement.href = blobURL
        hiddenElement.target = '_blank'
        hiddenElement.click()

        return { data: null }
      }
    })
  })
})
export const {
  useGetTransactionsQuery,
  useGetXeroTransactionsQuery,
  useLazyGetXeroTransactionsQuery,
  usePostTransactionMutation,
  useUpdateTransactionMutation,
  useSyncTransactionMutation,
  useUploadTxFileMutation,
  useLazyGetTransactionsQuery,
  useGetListFilterAddressesQuery,
  useLazyDownloadTxFileQuery,
  useGetQueueTransactionsQuery,
  useLazyPreviewFileQuery
} = transactionsApi
