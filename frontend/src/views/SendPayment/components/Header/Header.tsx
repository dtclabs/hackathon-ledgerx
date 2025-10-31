import React from 'react'

import SwitchNetwork from '@/components/SwitchNetwork/SwitchNetwork'
import MeatmaskInfo from '../MetamaskInfo/MetamaskInfo'

const Header: React.FC<{
  forceNetwork?: any
}> = ({ forceNetwork }) => (
  <div className="w-full h-[60px] flex items-center justify-between  bg-white border-b">
    <div className="flex items-center font-inter text-sm font-medium gap-8 text-black-0">
      <a className="ml-8" href="https://ledgerx.com">
        <img className="w-[180px]" src="/svg/logos/ledgerx-logo.svg" alt="logo" />
      </a>
      <a href="https://ledgerx.com" className="text-gray-1100 text-sm hover:text-neutral-900">
        Book-keeping for your crypto needs
      </a>
    </div>
    <div className="flex items-center justify-end gap-3 mr-8">
      {!forceNetwork && <SwitchNetwork showImage extendPrimaryButtonClass="text-[10px] h-[40px] gap-4" />}
      <MeatmaskInfo />
    </div>
  </div>
)
export default Header
