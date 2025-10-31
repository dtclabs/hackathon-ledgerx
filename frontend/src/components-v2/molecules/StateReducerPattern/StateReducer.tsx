import React, { createContext, useContext, useReducer } from 'react'

// Step 1: Create a context to hold the state
const StateContext = createContext(null)

// Step 3: Create a state provider component
export const StateProvider = ({ children, value }) => (
  <StateContext.Provider value={value}>{children}</StateContext.Provider>
)

// Step 5: Create child components that can access the state
export const CounterDisplay = () => {
  const { count } = useContext(StateContext)

  return <div>Count: {count}</div>
}

export const CounterButtons = () => {
  const { handleDecrement, handleIncrement } = useContext(StateContext)

  const increment = () => {
    handleIncrement()
  }

  const decrement = () => {
    handleDecrement()
  }

  return (
    <div>
      <button type="button" onClick={increment}>
        Increment
      </button>
      <button type="button" onClick={decrement}>
        Decrement
      </button>
    </div>
  )
}

const StateReducer = () => <div>sds</div>

export default StateReducer
