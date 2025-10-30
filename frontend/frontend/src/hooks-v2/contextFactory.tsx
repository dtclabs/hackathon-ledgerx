/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useCallback } from 'react'

type State = {
  // Define your state properties here
  count: number
  name: string
}

type ContextValue = {
  state: State
  updateState: (newState: Partial<State>) => void
}

const createCustomContext = (
  initialState: State,
  customActions: (state: State) => Partial<{ [key: string]: () => void }>
): (() => ContextValue) => {
  const CustomContext = createContext<ContextValue>({} as ContextValue)

  const useCustomContext = (): ContextValue => useContext(CustomContext)

  const CustomContextProvider: React.FC<any> = ({ children }) => {
    const [state, setState] = useState<State>(initialState)

    const updateState = useCallback((newState: Partial<State>) => {
      setState((prevState) => ({
        ...prevState,
        ...newState
      }))
    }, [])

    const contextActions = customActions(state)

    const memoizedContextActions = useCallback(
      () =>
        Object.entries(contextActions).reduce(
          (acc, [key, action]) => ({
            ...acc,
            [key]: useCallback(action, [])
          }),
          {}
        ),
      [contextActions]
    )

    const value: ContextValue = {
      state,
      updateState,
      ...memoizedContextActions()
    }

    return <CustomContext.Provider value={value}>{children}</CustomContext.Provider>
  }

  // @ts-ignore
  return () => useCustomContext
}

export default createCustomContext

/* eslint-disable react/jsx-no-constructed-context-values */
// import React, { createContext, useContext, useReducer } from 'react'

// // Define the context type
// type ContextType<State, Action> = {
//   state: State
//   dispatch: React.Dispatch<Action>
// }

// // Generic useContext hook
// function useContextHook<State, Action>(
//   reducer: React.Reducer<State, Action>,
//   initialState: State
// ): ContextType<State, Action> {
//   // Create the context
//   const Context = createContext<ContextType<State, Action> | undefined>(undefined)

//   // Create the provider component
//   const Provider: React.FC<any> = ({ children }) => {
//     const [state, dispatch] = useReducer(reducer, initialState)
//     const contextValue = { state, dispatch }

//     return <Context.Provider value={contextValue}>{children}</Context.Provider>
//   }

//   // Custom hook to access the context
//   function useCustomContext() {
//     const context = useContext(Context)
//     if (!context) {
//       throw new Error('useCustomContext must be used within a Provider')
//     }
//     return context
//   }

//   // @ts-ignore
//   return { Provider, useCustomContext }
// }

// export default useContextHook
