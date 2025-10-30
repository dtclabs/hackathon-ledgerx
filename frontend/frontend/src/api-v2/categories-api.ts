/* eslint-disable arrow-body-style */
import { api } from './index'

export enum CategoryType {
  EXPENSE = 'Expense',
  REVENUE = 'Revenue',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  ASSET = 'Asset'
}

interface ICategory {
  name: string
  type: CategoryType
  code: string
  description?: string
}

interface IPostCategory {
  payload: ICategory
  orgId: string
  id?: string
}

interface IDeleteCategory {
  payload: {
    id: string
  }
  orgId: string
}

interface IReplaceCategories {
  payload: ICategory[]
  orgId: string
}

const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<any, any>({
      query: ({ orgId, params }) => ({
        url: `${orgId}/categories`,
        method: 'GET',
        params: { ...params }
      }),
      transformResponse: (response) => response.data,
      providesTags: ['categories']
    }),

    postCategory: builder.mutation<any, IPostCategory>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/categories`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['categories']
    }),

    deleteCategory: builder.mutation<any, IDeleteCategory>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/categories/${payload.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['categories']
    }),

    editCategory: builder.mutation<any, IPostCategory>({
      query: ({ orgId, payload, id }) => ({
        url: `${orgId}/categories/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['categories']
    }),

    replaceCategories: builder.mutation<any, IReplaceCategories>({
      query: ({ orgId, payload }) => ({
        url: `${orgId}/categories/replace`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['categories']
    }),

    getCategoryFilters: builder.query<any, any>({
      query: ({ orgId }) => ({
        url: `${orgId}/categories/filter`,
        method: 'GET'
      }),
      transformResponse: (response) => response.data,
      providesTags: ['categories']
    })
  })
})

export const {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
  usePostCategoryMutation,
  useReplaceCategoriesMutation,
  useGetCategoryFiltersQuery
} = categoriesApi
