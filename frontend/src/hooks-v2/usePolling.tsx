// usePolling.ts
import { useEffect, useRef } from 'react'

type ConditionCallback<T> = (response: T) => boolean
type ApiFunction = () => Promise<any>

const usePolling = <T,>(apiFunction: any, conditionCallback: ConditionCallback<T>, pollingInterval = 3000) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const startPolling = async () => {
      try {
        const response = await apiFunction()

        if (!conditionCallback(response)) {
          intervalRef.current = setTimeout(startPolling, pollingInterval)
        }
      } catch (error) {
        console.error('Error occurred while polling:', error)
      }
    }

    const handlePolling = async () => {
      // Clear any existing timeout
      clearTimeout(intervalRef.current)

      // Start the initial polling immediately
      await startPolling()

      // Schedule subsequent polling after the interval
      intervalRef.current = setTimeout(handlePolling, pollingInterval)
    }

    handlePolling()

    return () => {
      clearTimeout(intervalRef.current)
    }
  }, [apiFunction, conditionCallback, pollingInterval])
}

export default usePolling
