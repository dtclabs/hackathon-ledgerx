import { utils } from 'ethers'

export const supportNetwork: any = {
  ethereum: {
    chainId: utils.hexValue(1),
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  goerli: {
    chainId: utils.hexValue(5),
    chainName: 'Goerli Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://goerli.etherscan.io/']
  },
  arbitrum_one: {
    chainId: utils.hexValue(42161),
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io/']
  },
  polygon: {
    chainId: utils.hexValue(137),
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com/']
  },
  // mumbai: {
  //   chainId: `0x${Number(80001).toString(16)}`,
  //   chainName: 'Mumbai',
  //   nativeCurrency: {
  //     name: 'MATIC',
  //     symbol: 'MATIC',
  //     decimals: 18
  //   },
  //   rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
  //   blockExplorerUrls: ['https://mumbai.polygonscan.com']
  // },
  // Avalanche: {
  //   chainId: `0x${Number(43114).toString(16)}`,
  //   chainName: 'Avalanche C-Chain',
  //   nativeCurrency: {
  //     name: 'AVAX',
  //     symbol: 'AVAX',
  //     decimals: 18
  //   },
  //   rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  //   blockExplorerUrls: ['https://snowtrace.io']
  // },
  bsc: {
    chainId: utils.hexValue(56),
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorerUrls: ['https://bscscan.com/']
  }
}

// export enum ESupportNetworks {
//   'Ethereum' = 'Ethereum',
//   'Goerli' = 'Goerli',
//   // 'Polygon' = 'Polygon'
//   // 'Mumbai' = 'mumbai',
//   // 'Avalanche' = 'Avalanche',
//   // 'BSC' = 'BSC'
// }

// export enum ESupportNetworksProd {
//   'Ethereum' = 'Ethereum',
//   // 'Polygon' = 'Polygon'
//   // 'Mumbai' = 'mumbai',
//   // 'Avalanche' = 'Avalanche',
//   // 'BSC' = 'BSC'
// }

// export enum EMultisendSupportNetworksProd {
//   'Ethereum' = 'Ethereum',
//   // 'Polygon' = 'Polygon',
//   'Goerli' = 'Goerli'
//   // 'Mumbai' = 'mumbai',
//   // 'Avalanche' = 'Avalanche',
//   // 'BSC' = 'BSC'
// }
