import { ETHEREUM_MAINNET_CHAIN, GOERLI_TESTNET_CHAIN } from './chains'

export const networkConfigs = {
  [GOERLI_TESTNET_CHAIN]: {
    nativeTokenId: 'ethereum',
    nativeToken: 'ETH',
    scanUrlHash: 'https://goerli.etherscan.io/',
    scanUrlAddress: 'https://goerli.etherscan.io/address/',
    nativeLogo: '/svg/ETH.svg',
    usdc: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    xsgd: '0x74298183A2A5460B1240fF43cc3C3E8327eA83e6',
    xidr: '0xc039E7f1e44384f207948e9fF12e345caB3fA30C',
    usdt: '0xaC63D1AE50ef9860508D5fC21FcDA7afF8db524a',
    bluesgd: '0x7cA7f84d27f11C3a1c24612b641e4Cca7C2E923B',
    dai: '0xf2edF1c091f683E3fb452497d9a98A49cBA84666',
    disperse: '0xD152f549545093347A162Dce210e7293f1452150',
    mantle:'0x3c3a81e81dc49a522a592e7622a7e711c06bf354',
    scanApi: 'https://api-goerli.etherscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'DDENIGIFJJ5WF8V4XDJ57ZTSICCUJQBNU3',
    apiLink: (address: string, size: string) =>
      `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${size}&sort=desc&apikey=${
        process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'DDENIGIFJJ5WF8V4XDJ57ZTSICCUJQBNU3'
      }`,
    contractABIApi: (address: string) =>
      `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${
        process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'DDENIGIFJJ5WF8V4XDJ57ZTSICCUJQBNU3'
      }`
  },
  [ETHEREUM_MAINNET_CHAIN]: {
    nativeTokenId: 'ethereum',
    nativeToken: 'ETH',
    scanUrlHash: 'https://etherscan.io/',
    scanUrlAddress: 'https://etherscan.io/address/',
    nativeLogo: '/svg/ETH.svg',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    disperse: '0xD152f549545093347A162Dce210e7293f1452150',
    xsgd: '0x70e8dE73cE538DA2bEEd35d14187F6959a8ecA96',
    xidr: '0xebF2096E01455108bAdCbAF86cE30b6e5A72aa52',
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    bluesgd: '0x92830ef7c8d651Ed3A708053c602E807bAd7db22',
    mantle:'0x3c3a81e81dc49a522a592e7622a7e711c06bf354',
    socol:'0x41c21693e60fc1a5dbb7c50e54e7a6016aa44c99',
    /* eslint-disable no-useless-computed-key */
    ['matic-network']:'0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    ['the-sandbox']: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    scanApi: 'https://api-etherscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'DDENIGIFJJ5WF8V4XDJ57ZTSICCUJQBNU3',
    apiLink: (address: string, size: string) =>
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${size}&sort=desc&apikey=${
        process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'DDENIGIFJJ5WF8V4XDJ57ZTSICCUJQBNU3'
      }`,
    contractABIApi: (address: string) =>
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${
        process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'DDENIGIFJJ5WF8V4XDJ57ZTSICCUJQBNU3'
      }`
  }
}
