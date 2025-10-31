import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { InjectedConnector } from '@web3-react/injected-connector'

const supportedChainIds = [1, 3, 4, 5, 42 /* other chain IDs you support */]

const walletconnect = new WalletConnectConnector({
  rpc: { 1: 'https://mainnet.infura.io/v3/YOUR_INFURA_ID' /* Add other RPC URLs for other chains */ },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  supportedChainIds
})

const Injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42]
})
