/* eslint-disable no-continue */

import { useWeb3React } from '@web3-react/core'
import { createContext, FunctionComponent, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export interface IAppContext {
  chainList: { chainId: number; network: string; tokenImage: string }[]
  activeChain?: { chainId: number; network: string; tokenImage: string }
  setActiveChain?: (chain: { chainId: number; network: string; tokenImage: string }) => void
  // getFundAssets?: (price?: any) => Promise<{
  //   [id: string]: {
  //     decimals: number | null
  //     token: string | null
  //     tokenAddress: string | null
  //     balance: string
  //     usdBalance?: string
  //   }[]
  // }>
}

export const AppContext = createContext<IAppContext>({
  chainList: []
})

export function useAppContext(): IAppContext {
  return useContext(AppContext)
}

interface IAppState {
  children: ReactNode
}
interface IAppProps {
  children?: ReactNode
}

export const AppProvider: FunctionComponent<IAppState> = ({ children }: IAppProps) => {
  const [chainList, setChainList] = useState<{ chainId: number; network: string; tokenImage: string }[]>([
    { chainId: 4, network: 'Rinkeby', tokenImage: '/svg/ETH.svg' },
    { chainId: 1, network: 'Ethereum', tokenImage: '/svg/ETH.svg' }
  ])

  const contextProvider = useMemo(() => ({ chainList }), [chainList])
  return <AppContext.Provider value={contextProvider}>{children}</AppContext.Provider>
}
