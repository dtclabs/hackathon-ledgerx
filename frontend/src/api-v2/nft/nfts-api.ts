import { IPagination } from '@/api/interface'
import { api } from '../index'
import { ICollectionSimplified, IGetNftsParams, INft, INftAggregate, INftCollection, INftSync, INftWaitList } from './nfts.type'

export const nftsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSimplifiedCollections: builder.query<ICollectionSimplified[], { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/nft-collections/dropdown`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data
      // providesTags: ['nfts']
    }),
    getCollections: builder.query<IPagination<INftCollection>, IGetNftsParams>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/nft-collections`,
        method: 'GET',
        params
      }),
      transformResponse: (res) => res.data,
      providesTags: ['nfts']
    }),
    getNfts: builder.query<IPagination<INft>, IGetNftsParams>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/nfts`,
        method: 'GET',
        params
      }),
      transformResponse: (res) => res.data,
      providesTags: ['nfts']
    }),
    getCollection: builder.query<INftCollection, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/nft-collections/${id}`,
        method: 'GET',
        params: {
          id,
          organizationId
        }
      }),
      transformResponse: (res) => res.data,
      providesTags: ['nfts']
    }),
    getNft: builder.query<INft, { organizationId: string; id: string }>({
      query: ({ organizationId, id }) => ({
        url: `${organizationId}/nfts/${id}`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['nfts']
    }),
    getNftAggregate: builder.query<INftAggregate, IGetNftsParams>({
      query: ({ organizationId, params }) => ({
        url: `${organizationId}/nfts/aggregate`,
        method: 'GET',
        params
      }),
      transformResponse: (res) => res.data,
      providesTags: ['nfts']
    }),
    syncNftData: builder.mutation<INftSync, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/nft-syncs`,
        method: 'POST'
      }),
      transformResponse: (res) => res.data
      // invalidatesTags: ['nfts']
    }),
    getLatestNftSync: builder.query<INftSync, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/nft-syncs/latest`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data
      // providesTags: ['nfts']
    }),
    requestNFTWaitList: builder.mutation<{ organizationId: string }, INftWaitList>({
      query: ({ organizationId, payload }) => ({
        url: `${organizationId}/feature-waitlist-requests`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (res) => res.data,
      invalidatesTags: ['nft-whitelist']
    }),
    getNftWaitlist: builder.query<any, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `${organizationId}/feature-waitlist-requests`,
        method: 'GET'
      }),
      transformResponse: (res) => res.data,
      providesTags: ['nft-whitelist']
    })
  })
})

export const {
  useGetCollectionsQuery,
  useGetNftsQuery,
  useGetCollectionQuery,
  useGetNftQuery,
  useSyncNftDataMutation,
  useGetLatestNftSyncQuery,
  useGetNftAggregateQuery,
  useLazyGetCollectionQuery,
  useLazyGetNftQuery,
  useGetNftWaitlistQuery,
  useLazyGetLatestNftSyncQuery,
  useGetSimplifiedCollectionsQuery,
  useRequestNFTWaitListMutation
} = nftsApi
