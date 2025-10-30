import { ICategories } from '@/slice/categories/interfaces'
import { IPagination } from '@/api/interface'
import { AppState } from '@/state'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface ICategoriesState {
  categories: IPagination<ICategories>
  filtersSearch: any
}

const initialState: ICategoriesState = {
  categories: { currentPage: 0, items: [], limit: 0, totalItems: 0, totalPages: 0 },
  filtersSearch: null
}

export const categoriesSlice = createSlice({
  name: 'categories-slice',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<IPagination<ICategories>>) => {
      state.categories = action.payload
    },
    setFiltersSearch: (state, action: any) => {
      const list: ICategories[] = []
      if (action.payload) {
        for (const category of action.payload) {
          list.push(state.categories.items.find((item) => item.name === category))
        }
        state.filtersSearch = list
      } else state.filtersSearch = undefined
    }
  }
})

export const { setCategories, setFiltersSearch } = categoriesSlice.actions

const selectSelf = (state: AppState) => state.categories

export const categoriesSelector = createSelector(selectSelf, (state) => state.categories)
export const filtersSearchSelector = createSelector(selectSelf, (state) => state.filtersSearch)
