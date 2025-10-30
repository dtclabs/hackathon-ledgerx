import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/legacy/image'
import { useChainName } from '@/hooks/useChainName'
import ETH from '@/assets/svg/ETH.svg'

const Network: React.FC = () => {
  const { account } = useWeb3React()
  const NameNetwork = useChainName()
  const Name = NameNetwork.toLocaleLowerCase()

  return account ? (
    <div className="flex bg-white items-center rounded-lg hover:bg-gray-100 cursor-pointer">
      <div className=" mx-4 flex items-center">
        <Image src={ETH} width={16} height={16} alt="logo" />
      </div>
      <div className="text-xs leading-3 font-inter mr-4">
        <p className="font-semibold text-[#374151]">{Name.charAt(0).toUpperCase() + Name.slice(1)}</p>
        <p className="font-medium text-[#6B7280]">Network</p>
      </div>
    </div>
  ) : null
}

export default Network
