/* eslint-disable dot-notation */
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState, FC } from 'react'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/state'
import DropDown from '../DropDown/DropDown'
import { supportNetwork } from './data'
import { CHAINID } from '@/constants/chains'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { useGetChainsQuery } from '@/api-v2/chain-api'
import { setChain, selectedChainSelector } from '@/slice/platform/platform-slice'
import { ethers } from 'ethers'

const SwitchNetwork: FC<{
  extendPrimaryButtonClass?: string
  isDashBoard?: boolean
  setStatus?: (status) => void
  showImage?: boolean
}> = ({ extendPrimaryButtonClass, isDashBoard, setStatus, showImage }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const selectedChain = useAppSelector(selectedChainSelector)
  const { data: supportedChains } = useGetChainsQuery({})
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const { account, chainId: connectedChainId } = useWeb3React()

  useEffect(() => {
    if (account && connectedChainId && supportedChains) {
      // setNameNetwork(NETWORK_MAP[connectedChainId])
      // window.localStorage.setItem(CHAINID, String(connectedChainId))
    } else {
      // const currentNetwork = window.localStorage.getItem('CURRENT_NETWORK')
      // if (currentNetwork) {
      //   setNameNetwork(currentNetwork)
      //   window.localStorage.setItem(CHAINID, parseInt(supportNetwork[currentNetwork].chainId, 16).toString())
      // } else {
      //   setNameNetwork('Ethereum')
      //   window.localStorage.setItem(CHAINID, parseInt(supportNetwork['Ethereum'].chainId, 16).toString())
      // }
    }
  }, [connectedChainId, router.pathname, account])

  // useEffect(() => {
  //   if (router.pathname === '/multisend') setESupportNetworks(EMultisendSupportNetworksProd)
  // }, [router.pathname])

  const handleChangeNetwork = async (chain: any) => {
    try {
      dispatch(setChain(chain.chainId))

      // TODO - Remove Local Storage Stuff
      window.localStorage.setItem(CHAINID, chain.chainId)
      window.localStorage.setItem('CURRENT_NETWORK', chain.name)

      if (account) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chain.chainId}` }]
        })
      }
    } catch (switchError: any) {
      // if (switchError.code === -32002) {
      //   setStatus(true)
      // }

      // if (window && !window.ethereum) throw new Error('No crypto wallet found')
      sentryCaptureException(switchError)
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            ...supportNetwork[chain.id]
          }
        ]
      })
      // if (switchError && switchError.code !== 4001) {
      //   await window.ethereum.request({
      //     method: 'wallet_addEthereumChain',
      //     params: [
      //       {
      //         ...supportNetwork[networkName]
      //       }
      //     ]
      //   })
      // }
    }
  }

  const primaryButtonOption = () => (
    <button
      type="button"
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
      className={`flex justify-between px-4 gap-2 items-center ${
        isDashBoard ? 'min-w-[185px]' : ' w-full min-w-[135px]'
      } rounded-lg text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-grey-901 ${
        router.pathname !== '/multisend' ? 'h-12 border border-[#D0D5DD]' : 'h-10 bg-white'
      } ${extendPrimaryButtonClass || ''}`}
      id="menu-button"
      aria-expanded="true"
      aria-haspopup="true"
    >
      {showImage && <img src="/svg/ETH.svg" alt="ETH" />}
      <div className="flex items-center gap-2 w-full ">
        <div className="leading-4 text-left font-inter">
          <p className="font-semibold text-[#374151] ">{selectedChain?.name}</p>
          <p className="font-medium text-[#6B7280]">Network</p>
        </div>
      </div>
      <img
        src={(isDashBoard && '/svg/ArrowBox.svg') || '/svg/BorderArrow.svg'}
        alt="DownArrow"
        className={isShowDropDown ? 'rotate-180 ' : ''}
      />
    </button>
  )
  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={primaryButtonOption()}
      maxHeight="max-h-[50vh] "
    >
      {supportedChains?.data
        ?.filter((chain) => ['ethereum', 'goerli'].includes(chain.id))
        ?.map((chain, index) => (
          <button
            type="button"
            className="w-full flex items-center px-4 h-10 disabled:cursor-pointer gap-2 whitespace-nowrap hover:bg-gray-50"
            role="menuitem"
            tabIndex={index}
            id={`menu-item-${index}`}
            key={chain.id}
            onClick={() => handleChangeNetwork(chain)}
            // disabled={nameNetwork === eSupportNetworks[item]}
          >
            <div className="w-[20%]">
              <img src="/svg/ETH.svg" alt="ETH" className="w-auto h-4 " />
            </div>
            <div className="flex w-full justify-between items-center">
              <p className="font-inter text-sm  text-gray-700 leading-6 font-semibold truncate">{chain.name}</p>
            </div>
          </button>
        ))}
    </DropDown>
  )
}

export default SwitchNetwork
