import { createContext, useReducer } from 'react'

export const stateCtx = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_IS_ICON_VISIBLE':
      return { ...state, isIconVisible: action.payload }

    case 'SET_IS_OPEN':
      return { ...state, isOpen: action.payload }

    default:
      return state
  }
}

const initialState = {
  isIconVisible: false,
  isOpen: false
}

interface IUseModalHook {
  defaultState?: {
    isIconVisible?: boolean
    isOpen?: boolean
  }
}

export const useModalHook = ({ defaultState }: IUseModalHook) => {
  const [state, dispatch] = useReducer(stateCtx, { ...initialState, ...defaultState })
  // Dispatch the Types - Make a wrapper in this hook and export it under methods

  const setIsIconVisible = (data) => {
    dispatch({ type: 'SET_IS_ICON_VISIBLE', payload: { isIconVisible: false } })
  }

  const setIsOpen = (data) => {
    dispatch({ type: 'SET_IS_OPEN', payload: data })
  }

  return { state, dispatch, methods: { setIsIconVisible, setIsOpen } }
}

export const BaseCtx = createContext<{
  state: any
  dispatch: React.Dispatch<any>
}>({
  state: initialState,
  dispatch: () => undefined
})
