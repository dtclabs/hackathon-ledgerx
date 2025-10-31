/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useContext, useState } from 'react'

// Define the type for your state variables
type State = {
  [key: string]: any
}

// Define the type for the update functions
type UpdateFunctions = {
  [key: string]: (value: any) => void
}

// Define the type for the context
type ContextType = {
  state: State
  updateFunctions: UpdateFunctions
}

// Define the factory function

const createTypedContextProvider = (defaultState: State) => {
  const Context = createContext<ContextType | undefined>(undefined)

  const ContextProvider: any = ({ children }) => {
    const [state, setState] = useState<State>(defaultState)

    //   const updateFunctions: UpdateFunctions = Object.keys(defaultState).reduce(
    //     (acc, key) => {
    //       acc[key] = (value: any) => {
    //         setState((prevState) => ({
    //           ...prevState,
    //           [key]: value,
    //         }));
    //       };
    //       return acc;
    //     },
    //     {}
    //   );

    // @ts-ignore
    return <Context.Provider value={{ state, updateFunctions }}>{children}</Context.Provider>
  }

  function useTypedContext() {
    const context = useContext(Context)
    if (!context) {
      throw new Error('useTypedContext must be used within a TypedContextProvider')
    }
    return context
  }

  return { ContextProvider, useTypedContext }
}

// Example usage:

// Define the initial state
const initialState = {
  count: 0,
  text: ''
}

// Create the context provider using the factory function
const { ContextProvider, useTypedContext } = createTypedContextProvider(initialState)

// Child component that updates the count state variable
const CountUpdater: React.FC = () => {
  const { state, updateFunctions } = useTypedContext()

  const handleIncrement = () => {
    updateFunctions.count(state.count + 1)
  }

  return (
    <div>
      <p>Count: {state.count}</p>
      <button type="button" onClick={handleIncrement}>
        Increment
      </button>
    </div>
  )
}

// Parent component that renders the context provider and the child component
const ParentComponent: React.FC = () => (
  <ContextProvider>
    <CountUpdater />
  </ContextProvider>
)
