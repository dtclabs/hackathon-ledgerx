import { createContext, useReducer } from 'react'

export const tableReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItems: { ...state.selectedItems, ...action.payload } }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload }
    case 'SET_FILTERED_ITEMS':
      return { ...state, filteredItems: action.payload }
    default:
      return state
  }
}

export const initialState = {
  selectedItems: {},
  pageSize: 25,
  filteredItems: []
}

interface IProps {
  defaultState?: any
  pageSize?: number
}

export const useTableHook = ({ defaultState }: IProps) => {
  const [state, dispatch] = useReducer(tableReducer, { ...initialState, ...defaultState })
  // Dispatch the Types - Make a wrapper in this hook and export it under methods

  const setSelectedItem = (data) => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: data })
  }

  const setPageSize = (data) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: data })
  }

  const setFilteredItems = (data) => {
    dispatch({ type: 'SET_FILTERED_ITEMS', payload: data })
  }

  return { state, dispatch, methods: { setSelectedItem, setPageSize, setFilteredItems } }
}

export const TableCtx = createContext<{
  state: any
  dispatch: React.Dispatch<any>
}>({
  state: initialState,
  dispatch: () => undefined
})
