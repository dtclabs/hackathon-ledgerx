export const ETHEREUM_MAINNET_CHAIN = 1
export const GOERLI_TESTNET_CHAIN = 5
export const POLYGON_MAINNET_CHAIN = 137
export const BSC_MAINNET_CHAIN = 56
export const ARBITRUM_MAINNNET_CHAIN = 42161

export const SupportedChainId = {
  GOERLI: GOERLI_TESTNET_CHAIN,
  MAINNET: ETHEREUM_MAINNET_CHAIN,
  POLYGON: POLYGON_MAINNET_CHAIN,
  BSC: BSC_MAINNET_CHAIN,
  ARBITRUM_ONE: ARBITRUM_MAINNNET_CHAIN
}

export const SupportedChainIdProd = {
  MAINNET: ETHEREUM_MAINNET_CHAIN,
  POLYGON: POLYGON_MAINNET_CHAIN,
  BSC: BSC_MAINNET_CHAIN,
  ARBITRUM_ONE: ARBITRUM_MAINNNET_CHAIN
}

export const CHAINID = 'CHAIN_ID'

export const SupportedRPCs = {
  GOERLI: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  MAINNET: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
}

export const ListNativeToken = [
  { chainId: ETHEREUM_MAINNET_CHAIN, name: 'ETH' },
  { chainId: GOERLI_TESTNET_CHAIN, name: 'ETH' }
]

export const CHAIN_NAME = [
  {
    name: 'Ethereum',
    chainId: ETHEREUM_MAINNET_CHAIN,
    link: 'https://etherscan.io/'
  },
  {
    name: 'Goerli',
    chainId: GOERLI_TESTNET_CHAIN,
    link: 'https://goerli.etherscan.io/'
  }
]
