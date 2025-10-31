export interface IMetamaskHistory {
  sourceList: string[]
  sourceAddress: string
  price: any
  onShowTransactionMetaMask: (item: any) => void
  metamaskHistory: any[]
  toggleExpandTransaction: (hash: string) => void
  setMetamaskTransactions: any
  setConnectError: React.Dispatch<React.SetStateAction<boolean>>
}
export interface IMetamaskHistoryPending {
  sourceAddress: string
  price?: any
  metamaskHistory?: any[]
  toggleExpandTransaction?: (hash: string) => void
  setMetamaskTransactions?: any
}
