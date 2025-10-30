import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { Web3Provider } from '@ethersproject/providers'
import { SupportedChainId, SupportedChainIdProd, SupportedRPCs } from '@/constants/chains'

const POLLING_INTERVAL = 12000


const injected = new InjectedConnector({
  supportedChainIds: Object.values(
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? SupportedChainIdProd : SupportedChainId
  )
})

const RPCs = {}
Object.keys(process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? SupportedChainIdProd : SupportedChainId).forEach(
  (key) => {
    RPCs[key] = SupportedRPCs[key]
  }
)


export const walletconnect = new WalletConnectConnector({
  rpc: RPCs,
  qrcode: true,
  supportedChainIds: Object.values(
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? SupportedChainIdProd : SupportedChainId
  )
})

export enum ConnectorNames {
  Injected = 'injected',
  WalletConnect = 'walletconnect'
}

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect
}

export const connectorLocalStorageKey = 'connectorIdv2'

export const walletLocalStorageKey = 'wallet'

export const getLibrary = (provider): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = POLLING_INTERVAL
  return library
}
