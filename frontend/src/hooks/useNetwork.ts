import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { networkConfigs } from '@/constants/network'
import { getDisperseContract, getErc20Contract } from '@/utils/contractHelpers'

export interface IToken {
  name?: string
  tokenAddress?: string
  decimal?: number
  logoUrl?: string
  tokenId?: string
  nativeToken?: string
  symbol?: string
}

export const useNetWork = () => {
  const { chainId, library } = useWeb3React()
  const [usdcContract, setUSDCContract] = useState<any>()
  const [xsgdContract, setXSGDcontract] = useState<any>()
  const [xidrContract, setXIDRcontract] = useState<any>()
  const [disperse, setDisperse] = useState<any>()
  const [tokens, setTokens] = useState<IToken[]>([])
  const [freeSupportTokens, setFreeSupportTokens] = useState<IToken[]>([])
  const [networkConfig, setNetworkConfig] = useState<any>(networkConfigs['1'])

  useEffect(() => {
    if (chainId && networkConfigs[chainId.toString()] && library) {
      const usdcERC20 =
        networkConfigs[chainId.toString()].usdc &&
        getErc20Contract(networkConfigs[chainId.toString()].usdc, library.getSigner())
      const xsgdERC20 =
        networkConfigs[chainId.toString()].xsgd &&
        getErc20Contract(networkConfigs[chainId.toString()].xsgd, library.getSigner())
      const xidrERC20 =
        networkConfigs[chainId.toString()].xidr &&
        getErc20Contract(networkConfigs[chainId.toString()].xidr, library.getSigner())
      const disperseContract =
        networkConfigs[chainId.toString()].disperse &&
        getDisperseContract(networkConfigs[chainId.toString()].disperse, library.getSigner())
      if (usdcERC20) setUSDCContract(usdcERC20)
      if (xsgdERC20) setXSGDcontract(xsgdERC20)
      if (xidrERC20) setXIDRcontract(xidrERC20)
      if (disperseContract) setDisperse(disperseContract)

      const listToken = [
        {
          name: '',
          tokenAddress: '',
          decimal: 18,
          logoUrl: networkConfigs[chainId.toString()].nativeLogo,
          tokenId: networkConfigs[chainId.toString()].nativeTokenId,
          nativeToken: networkConfigs[chainId.toString()].nativeToken,
          symbol: networkConfigs[chainId.toString()].nativeToken
        },
        {
          name: 'USDC',
          symbol: 'USDC',
          tokenAddress: networkConfigs[chainId.toString()].usdc,
          decimal: 6,
          logoUrl: '/svg/USDC.svg',
          tokenId: 'usd-coin'
        }
      ]

      if (networkConfigs[chainId.toString()].xsgd) {
        listToken.push({
          name: 'XSGD',
          tokenAddress: networkConfigs[chainId.toString()].xsgd,
          decimal: 6,
          logoUrl: '/svg/XSGD.svg',
          tokenId: 'xsgd',
          symbol: 'XSGD'
        })
      }
      if (networkConfigs[chainId.toString()].xidr) {
        listToken.push({
          name: 'XIDR',
          tokenAddress: networkConfigs[chainId.toString()].xidr,
          decimal: 6,
          logoUrl: '/svg/XIDR.svg',
          tokenId: 'straitsx-indonesia-rupiah',
          symbol: 'XIDR'
        })
      }
      setTokens(
        networkConfigs[chainId.toString()]
          ? listToken
          : [
              {
                name: '',
                tokenAddress: '',
                decimal: 18,
                logoUrl: networkConfigs[chainId.toString()] && networkConfigs[chainId.toString()].nativeLogo,
                tokenId: networkConfigs[chainId.toString()] && networkConfigs[chainId.toString()].nativeTokenId
              }
            ]
      )

      const listSupportedTokens = [
        {
          name: '',
          tokenAddress: '',
          decimal: 18,
          logoUrl: networkConfigs[chainId.toString()].nativeLogo
        },
        {
          name: 'USDC',
          tokenAddress: networkConfigs[chainId.toString()].usdc,
          decimal: 6,
          logoUrl: '/svg/USDC.svg'
        }
      ]
      if (networkConfigs[chainId.toString()].xsgd) {
        listSupportedTokens.push({
          name: 'XSGD',
          tokenAddress: networkConfigs[chainId.toString()].xsgd,
          decimal: 6,
          logoUrl: '/svg/XSGD.svg'
        })
      }
      if (networkConfigs[chainId.toString()].xidr) {
        listSupportedTokens.push({
          name: 'XIDR',
          tokenAddress: networkConfigs[chainId.toString()].xidr,
          decimal: 6,
          logoUrl: '/svg/XIDR.svg'
        })
      }
      setFreeSupportTokens(
        networkConfigs[chainId.toString()]
          ? listSupportedTokens
          : [{ name: '', tokenAddress: '', decimal: 18, logoUrl: '/svg/ETH.svg' }]
      )
      setNetworkConfig(networkConfigs[chainId.toString()])
    }
  }, [library, chainId])

  const ETH = ''

  const hiddenCoinList = [
    { name: 'SOL', icon: '/svg/SOL.svg' },
    { name: 'BTC', icon: '/svg/BTC.svg' },
    { name: 'USDT', icon: '/svg/USDT.svg' }
  ]

  return {
    ETH,
    disperse,
    xidrContract,
    xsgdContract,
    usdcContract,
    hiddenCoinList,
    tokens,
    freeSupportTokens: freeSupportTokens.filter((item) => item),
    networkConfigs: networkConfig
  }
}
