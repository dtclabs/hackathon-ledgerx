import { useEffect, useReducer } from 'react'

const internalReducer = ({ count }, { type, payload }) => {
  switch (type) {
    case 'increment':
      return {
        count: Math.min(count + 1, payload.max)
      }
    case 'decrement':
      return {
        count: Math.max(0, count - 1)
      }
    case 'setCount':
      return {
        count: payload.count
      }
    default:
      throw new Error(`Unhandled action type: ${type}`)
  }
}

function useStateReducer({ initial }) {
  const max = 10
  const [{ count }, dispatch] = useReducer(internalReducer, { count: initial })

  const setCount = (value: any) => {
    dispatch({ type: 'setCount', payload: { count: value } })
  }

  const handleIncrement = () => {
    dispatch({ type: 'increment', payload: { max } })
  }

  const handleDecrement = () => {
    dispatch({ type: 'decrement', payload: { max } })
  }

  return {
    count,
    setCount,
    handleIncrement,
    handleDecrement
  }
}

useStateReducer.reducer = internalReducer
useStateReducer.types = {
  increment: 'increment',
  decrement: 'decrement'
}

export { useStateReducer }
