import { createSelector, createSlice } from '@reduxjs/toolkit'
import { IListFilterAddresses, ITransaction } from './interface'
import { IToken } from '@/hooks/useNetwork'
import { AppState } from '@/state'

export interface IFilterItems {
  fromList: string[]
  toList: string[]
  tokenList: any[]
}

interface ITxnState {
  listFilter?: IListFilterAddresses
  filterItems?: IFilterItems
}

const initialState: ITxnState = {
  listFilter: {
    from: [],
    to: []
  },
  filterItems: {
    fromList: [],
    toList: [],
    tokenList: []
  }
}

export const transactionsSlice = createSlice({
  name: 'transactions-slice',
  initialState,
  reducers: {
    setFilterFromItemList: (state, action) => {
      state.filterItems = { ...state.filterItems, fromList: action.payload }
    },
    setFilterToItemList: (state, action) => {
      state.filterItems = { ...state.filterItems, toList: action.payload }
    },
    setFilterTokenItemList: (state, action) => {
      state.filterItems = { ...state.filterItems, tokenList: action.payload }
    },
    setListFilter: (state, action) => {
      state.listFilter = action.payload
    }
  }
})

export const { setFilterFromItemList, setListFilter, setFilterToItemList, setFilterTokenItemList } =
  transactionsSlice.actions

const selectSelf = (state: AppState) => state.transaction

export const listFilterSelector = createSelector(selectSelf, (state) => state.listFilter)
export const filterItemsSelector = createSelector(selectSelf, (state) => state.filterItems)
