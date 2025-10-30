import { createContext, useReducer, useContext } from 'react'

export const initialState = {
  isOpen: false
}

export const buttonReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_IS_OPEN':
      return { ...state, isOpen: action.payload }

    default:
      return state
  }
}

// interface IProps {
//   defaultState?: any
// }

export const useBtnHook = () => {
  const { state, dispatch } = useContext(ButtonCtx)

  const setIsIsOpen = (_isOpen) => {
    dispatch({ type: 'SET_IS_OPEN', payload: _isOpen })
  }
  return { setIsIsOpen, isOpen: state.isOpen, id: state.id }
  // const [state, dispatch] = useReducer(stateCtx, { ...initialState, ...defaultState })
  // Dispatch the Types - Make a wrapper in this hook and export it under methods

  // const setSelectedItem = (data) => {
  //   dispatch({ type: 'SET_SELECTED_ITEM', payload: data })
  // }

  // return { state, dispatch, methods: { setSelectedItem } }
}

export const ButtonCtx = createContext<{
  state: any
  dispatch: React.Dispatch<any>
}>({
  state: initialState,
  dispatch: () => undefined
})
