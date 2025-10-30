import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import Image from 'next/legacy/image'
import HeaderMetamask from '@/assets/svg/HeaderMetamask.svg'
import DropDown from '@/components/DropDown/DropDown'
import { toShort } from '@/utils/toShort'
import { connectorLocalStorageKey } from '@/utils/web3React'
import { CHAINID } from '@/constants/chains'

const MeatmaskInfo = () => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const router = useRouter()
  const { account, deactivate } = useWeb3React()

  const primaryButtonOption = () => (
    <button
      type="button"
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
      className={`flex justify-center gap-4 items-center w-full rounded-lg px-4 bg-white hover:bg-gray-100
        text-gray-700 text-sm leading-3 font-semibold border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-grey-901 h-10`}
      id="menu-button"
      aria-expanded="true"
      aria-haspopup="true"
    >
      <Image src={HeaderMetamask} alt="Metamask" />
      <div className="text-left flex font-inter items-center">
        <div className="flex flex-col leading-4 text-xs">
          <div className="text-gray-700 font-semibold">MetaMask</div>
          <div className="text-gray-500 font-medium">{account && toShort(account, 5, 4)}</div>
        </div>
      </div>
      <img src="/svg/BorderArrow.svg" alt="DownArrow" className={isShowDropDown ? 'rotate-180' : ''} />
    </button>
  )
  return (
    <div>
      {account ? (
        <DropDown
          isShowDropDown={isShowDropDown}
          setIsShowDropDown={setIsShowDropDown}
          triggerButton={primaryButtonOption()}
        >
          <button
            type="button"
            className="text-gray-700 w-full block px-4 text-sm leading-3 font-semibold  h-10 font-inter text-left hover:bg-gray-50"
            role="menuitem"
            tabIndex={-1}
            id="menu-item-3"
            onClick={(e) => {
              e.stopPropagation()
              window.localStorage.removeItem(connectorLocalStorageKey)
              // window.localStorage.removeItem(CHAINID)
              setIsShowDropDown(false)
              deactivate()
            }}
          >
            Disconnect
          </button>
        </DropDown>
      ) : null}
    </div>
  )
}

export default MeatmaskInfo
