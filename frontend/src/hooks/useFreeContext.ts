import { useContext } from 'react'
import FreeContext from '@/contexts/FreeContext'

const useFreeContext = () => {
  const context = useContext(FreeContext)
  return context
}

export default useFreeContext
