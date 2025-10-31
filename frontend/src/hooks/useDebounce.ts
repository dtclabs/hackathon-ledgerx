import { useEffect, useState } from 'react'

export function useDebounce(value: string, delay: number) {
  const [pending, setPending] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    setPending(true)
    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setPending(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return { pending, debouncedValue, setDebouncedValue }
}
