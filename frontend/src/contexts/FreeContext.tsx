import { createContext, useState, useMemo, useEffect, ReactNode } from 'react'
import { useWeb3React } from '@web3-react/core'
import { networkConfigs } from '@/constants/network'
import { getDisperseContract, getErc20Contract } from '@/utils/contractHelpers'
import { IToken } from '@/hooks/useNetwork'
import { ITokenSupported } from './types'

interface IDefaultValue {
  networkConfig?: any
  nativeToken?: IToken
  hiddenCoinList: any[]
  tokens?: IToken[]
  freeSupportTokens?: ITokenSupported[]
  usdcContract?: any
  xsgdContract?: any
  xidrContract?: any
  disperse?: any
  // recipients?: Array<{ address: string[]; amount: string[]; token: string[]; remark?: string[] }>
  recipients?: any
  platformLogoUrl?: string
  platformUrl?: string
  platformName?: string
  purpose?: string
  usdtContract?: any
  daiContract?: any
}

const hiddenCoinList = [
  { name: 'SOL', icon: '/svg/SOL.svg' },
  { name: 'BTC', icon: '/svg/BTC.svg' },
  { name: 'USDT', icon: '/svg/USDT.svg' }
]

const defaultValue: IDefaultValue = {
  hiddenCoinList
}

const FreeContext = createContext(defaultValue)

export const FreeProvider = ({
  children,
  recipients,
  platformLogoUrl,
  platformUrl,
  platformName,
  purpose
}: {
  children: ReactNode
  recipients?: Array<{ address: string[]; amount: string[]; token: string[]; remark: string[] }>
  platformLogoUrl?: string
  platformUrl?: string
  platformName?: string
  purpose?: string
}) => {
  const [networkConfig, setNetworkConfig] = useState()

  const { chainId, library } = useWeb3React()
  const [usdcContract, setUSDCContract] = useState<any>()
  const [xsgdContract, setXSGDcontract] = useState<any>()
  const [xidrContract, setXIDRcontract] = useState<any>()
  const [usdtContract, setUSDTcontract] = useState<any>()
  const [nativeToken, setNativeToken] = useState<IToken>()
  const [daiContract, setDAIcontract] = useState<any>()
  const [disperse, setDisperse] = useState<any>()
  const [tokens, setTokens] = useState<IToken[]>([])
  const [freeSupportTokens, setFreeSupportTokens] = useState<any>([])

  useEffect(() => {
    const setConfig = (id: string) => {
      const listToken = [
        {
          name: '',
          tokenAddress: '',
          decimal: 18,
          logoUrl: networkConfigs[id].nativeLogo,
          tokenId: networkConfigs[id].nativeTokenId,
          nativeToken: networkConfigs[id].nativeToken,
          symbol: networkConfigs[id].nativeToken
        },
        {
          name: 'USDC',
          tokenAddress: networkConfigs[id].usdc,
          decimal: 6,
          logoUrl: '/svg/USDC.svg',
          tokenId: 'usd-coin',
          symbol: 'USDC'
        }
      ]

      setNativeToken({
        name: '',
        tokenAddress: '',
        decimal: 18,
        logoUrl: networkConfigs[id].nativeLogo,
        tokenId: networkConfigs[id].nativeTokenId,
        nativeToken: networkConfigs[id].nativeToken,
        symbol: networkConfigs[id].nativeToken
      })
      if (networkConfigs[id].xsgd) {
        listToken.push({
          name: 'XSGD',
          tokenAddress: networkConfigs[id].xsgd,
          decimal: 6,
          logoUrl: '/svg/XSGD.svg',
          tokenId: 'xsgd',
          symbol: 'XSGD'
        })
      }
      if (networkConfigs[id].bluesgd) {
        listToken.push({
          name: 'BLUSGD',
          tokenAddress: networkConfigs[id].bluesgd,
          decimal: 18,
          logoUrl: '/svg/tokens/blu-sgd.png',
          tokenId: 'sgd-tracker',
          symbol: 'BLUSGD'
        })
      }
      if (networkConfigs[id].xidr) {
        listToken.push({
          name: 'XIDR',
          tokenAddress: networkConfigs[id].xidr,
          decimal: 6,
          logoUrl: '/svg/XIDR.svg',
          tokenId: 'straitsx-indonesia-rupiah',
          symbol: 'XIDR'
        })
      }
      if (networkConfigs[id].mantle) {
        listToken.push({
          name: 'MNT',
          symbol: 'MNT',
          tokenAddress: networkConfigs[id].mantle,
          decimal: 18,
          logoUrl: '/svg/mantle.png',
          tokenId: 'mantle'
        })
      }

      if (networkConfigs[id]['matic-network']) {
        listToken.push({
          name: 'MATIC',
          symbol: 'MATIC',
          tokenAddress: networkConfigs[id]['matic-network'],
          decimal: 18,
          logoUrl: '/svg/matic_new.png',
          tokenId: 'matic-network'
        })
      }

      if (networkConfigs[id]['the-sandbox']) {
        listToken.push({
          name: 'SAND',
          symbol: 'SAND',
          tokenAddress: networkConfigs[id]['the-sandbox'],
          decimal: 18,
          logoUrl: '/svg/sand.png',
          tokenId: 'sand'
        })
      }

      if (networkConfigs[id].socol) {
        listToken.push({
          name: 'SIMP',
          symbol: 'SIMP',
          tokenAddress: networkConfigs[id].socol,
          decimal: 18,
          logoUrl: '/svg/socol.png',
          tokenId: 'socol'
        })
      }

      if (networkConfigs[id].usdt) {
        listToken.push({
          name: 'USDT',
          tokenAddress: networkConfigs[id].usdt,
          decimal: 6,
          logoUrl: '/svg/NewUSDT.svg',
          tokenId: 'tether',
          symbol: 'USDT'
        })
      }
      if (networkConfigs[id].dai) {
        listToken.push({
          name: 'DAI',
          tokenAddress: networkConfigs[id].dai,
          decimal: 18,
          logoUrl: '/svg/DAI.svg',
          tokenId: 'dai',
          symbol: 'DAI'
        })
      }
      setTokens(
        networkConfigs[id]
          ? listToken
          : [
              {
                name: '',
                tokenAddress: '',
                decimal: 18,
                logoUrl: networkConfigs[id] && networkConfigs[id].nativeLogo,
                tokenId: networkConfigs[id] && networkConfigs[id].nativeTokenId
              }
            ]
      )

      const listSupportedTokens = [
        {
          name: '',
          tokenAddress: '',
          decimal: 18,
          logoUrl: networkConfigs[id].nativeLogo,
          tokenId: networkConfigs[id].nativeTokenId,
          nativeToken: networkConfigs[id].nativeToken,
          symbol: networkConfigs[id].nativeToken
        },
        {
          name: 'USDC',
          tokenAddress: networkConfigs[id].usdc,
          decimal: 6,
          logoUrl: '/svg/USDC.svg',
          tokenId: 'usd-coin',
          symbol: 'USDC'
        }
      ]

      if (networkConfigs[id].xsgd) {
        listSupportedTokens.push({
          name: 'XSGD',
          symbol: 'XSGD',
          tokenAddress: networkConfigs[id].xsgd,
          decimal: 6,
          logoUrl: '/svg/XSGD.svg',
          tokenId: 'xsgd'
        })
      }
      if (networkConfigs[id].xidr) {
        listSupportedTokens.push({
          name: 'XIDR',
          symbol: 'XIDR',
          tokenAddress: networkConfigs[id].xidr,
          decimal: 6,
          logoUrl: '/svg/XIDR.svg',
          tokenId: 'straitsx-indonesia-rupiah'
        })
      }
      if (networkConfigs[id].usdt) {
        listSupportedTokens.push({
          name: 'USDT',
          symbol: 'USDT',
          tokenAddress: networkConfigs[id].usdt,
          decimal: 6,
          logoUrl: '/svg/NewUSDT.svg',
          tokenId: 'tether'
        })
      }
      if (networkConfigs[id].dai) {
        listSupportedTokens.push({
          name: 'DAI',
          symbol: 'DAI',
          tokenAddress: networkConfigs[id].dai,
          decimal: 18,
          logoUrl: '/svg/DAI.svg',
          tokenId: 'dai'
        })
      }

      if (networkConfigs[id].mantle) {
        listSupportedTokens.push({
          name: 'MNT',
          symbol: 'MNT',
          tokenAddress: networkConfigs[id].mantle,
          decimal: 18,
          logoUrl: '/svg/mantle.png',
          tokenId: 'mantle'
        })
      }

      if (networkConfigs[id]['matic-network']) {
        listSupportedTokens.push({
          name: 'MATIC',
          symbol: 'MATIC',
          tokenAddress: networkConfigs[id]['matic-network'],
          decimal: 18,
          logoUrl: '/svg/matic_new.png',
          tokenId: 'matic-network'
        })
      }

      if (networkConfigs[id]['the-sandbox']) {
        listSupportedTokens.push({
          name: 'SAND',
          symbol: 'SAND',
          tokenAddress: networkConfigs[id]['the-sandbox'],
          decimal: 18,
          logoUrl: '/svg/sand.png',
          tokenId: 'sand'
        })
      }

      if (networkConfigs[id].socol) {
        listSupportedTokens.push({
          name: 'SIMP',
          symbol: 'SIMP',
          tokenAddress: networkConfigs[id].socol,
          decimal: 18,
          logoUrl: '/svg/socol.png',
          tokenId: 'socol'
        })
      }

      if (networkConfigs[id].bluesgd) {
        listSupportedTokens.push({
          name: 'BLUSGD',
          tokenAddress: networkConfigs[id].bluesgd,
          decimal: 18,
          logoUrl: '/svg/tokens/blu-sgd.png',
          tokenId: 'sgd-tracker',
          symbol: 'BLUSGD'
        })
      }

      setFreeSupportTokens(
        networkConfigs[id]
          ? listSupportedTokens
          : [{ name: '', tokenAddress: '', decimal: 18, logoUrl: '/svg/ETH.svg', symbol: 'ETH' }]
      )
      setNetworkConfig(networkConfigs[id])
    }

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
      const usdtERC20 =
        networkConfigs[chainId.toString()].usdt &&
        getErc20Contract(networkConfigs[chainId.toString()].usdt, library.getSigner())
      const daiERC20 =
        networkConfigs[chainId.toString()].dai &&
        getErc20Contract(networkConfigs[chainId.toString()].dai, library.getSigner())
      if (usdcERC20) setUSDCContract(usdcERC20)
      if (xsgdERC20) setXSGDcontract(xsgdERC20)
      if (xidrERC20) setXIDRcontract(xidrERC20)
      if (usdtERC20) setUSDTcontract(usdtERC20)
      if (daiERC20) setDAIcontract(daiERC20)
      if (disperseContract) setDisperse(disperseContract)

      setConfig(chainId.toString())
    } else {
      setConfig('1')
    }
  }, [library, chainId])

  const value = useMemo(
    () => ({
      networkConfig,
      hiddenCoinList,
      usdcContract,
      xidrContract,
      disperse,
      tokens,
      freeSupportTokens,
      xsgdContract,
      recipients,
      platformLogoUrl,
      platformUrl,
      platformName,
      purpose,
      usdtContract,
      nativeToken,
      daiContract
    }),
    [
      networkConfig,
      usdcContract,
      xidrContract,
      disperse,
      tokens,
      freeSupportTokens,
      xsgdContract,
      recipients,
      platformLogoUrl,
      platformUrl,
      platformName,
      purpose,
      usdtContract,
      nativeToken,
      daiContract
    ]
  )
  return <FreeContext.Provider value={value}>{children}</FreeContext.Provider>
}

export default FreeContext
