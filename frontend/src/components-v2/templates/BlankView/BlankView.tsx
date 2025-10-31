import React, { ReactElement } from 'react'
import { useGetChainsQuery } from '@/api-v2/chain-api'

interface IBlankView {
  children: ReactElement<any, any>
}

const BlankView: React.FC<IBlankView> = ({ children }) => {
  useGetChainsQuery({})
  return children
}

export default BlankView
