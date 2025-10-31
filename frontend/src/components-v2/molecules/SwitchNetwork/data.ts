export const supportNetwork: any = {
  Ethereum: {
    chainId: `0x${Number(1).toString(16)}`,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  Goerli: {
    chainId: `0x${Number(5).toString(16)}`,
    chainName: 'Goerli Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://goerli.etherscan.io/']
  }
  // Polygon: {
  //   chainId: `0x${Number(137).toString(16)}`,
  //   chainName: 'Matic Mainnet',
  //   nativeCurrency: {
  //     name: 'MATIC',
  //     symbol: 'MATIC',
  //     decimals: 18
  //   },
  //   rpcUrls: ['https://polygon-rpc.com'],
  //   blockExplorerUrls: ['https://explorer.matic.network/']
  // },
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
  // BSC: {
  //   chainId: `0x${Number(56).toString(16)}`,
  //   chainName: 'Binance Smart Chain Mainnet',
  //   nativeCurrency: {
  //     name: 'BNB',
  //     symbol: 'BNB',
  //     decimals: 18
  //   },
  //   rpcUrls: ['https://bsc-dataseed1.binance.org'],
  //   blockExplorerUrls: ['https://bscscan.com']
  // }
}
