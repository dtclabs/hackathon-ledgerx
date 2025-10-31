import { createContext, useReducer } from 'react'

export interface ITableState {
  selectedItems: any[]
  pageIndex: number
  pageSize: number
}

export const tableReducer = (state: ITableState, action: any) => {
  switch (action.type) {
    case 'SET_SELECTED_ITEM':
      return {
        ...state,
        selectedItems:
          state.selectedItems.findIndex((item) => item?.id === action.payload?.id) > -1
            ? state.selectedItems.filter((item) => item.id !== action.payload.id)
            : [...state.selectedItems, action.payload]
      }
    case 'SELECT_ALL_ITEMS':
      return { ...state, selectedItems: action.payload }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    case 'NEXT_PAGE':
      return { ...state, pageIndex: state.pageIndex + 1 }
    case 'PREV_PAGE':
      return { ...state, pageIndex: state.pageIndex - 1 }
    default:
      return state
  }
}

export const initialState: ITableState = {
  selectedItems: [],
  pageIndex: 0,
  pageSize: 25
}

export const useTableHook = ({ defaultState }: { defaultState?: Partial<ITableState> }) => {
  const [state, dispatch] = useReducer(tableReducer, { ...initialState, ...defaultState })

  const setSelectedItem = (data) => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: data })
  }

  const selectAllItems = (data) => {
    dispatch({ type: 'SELECT_ALL_ITEMS', payload: data })
  }

  const setPageSize = (data: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: data })
  }

  const setPageIndex = (data: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: data })
  }
  const nextPage = () => {
    dispatch({ type: 'NEXT_PAGE' })
  }
  const prevPage = () => {
    dispatch({ type: 'PREV_PAGE' })
  }

  return {
    state,
    dispatch,
    methods: { setSelectedItem, setPageSize, setPageIndex, selectAllItems, nextPage, prevPage }
  }
}

export const TableCtx = createContext<{
  state: ITableState
  dispatch: React.Dispatch<any>
}>({
  state: initialState,
  dispatch: () => undefined
})
