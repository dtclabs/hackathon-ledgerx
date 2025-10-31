/* eslint-disable dot-notation */
import Image from 'next/legacy/image'
import React, { useState, FC } from 'react'
import ethImage from '@/public/svg/ETH.svg'
import boxArrow from '@/public/svg/ArrowBox.svg'
import borderArrow from '@/public/svg/BorderArrow.svg'
import DropDown from '../../../components/DropDown/DropDown'


type IChain = {
    id: string
    name: string
}

const SwitchNetworkDropdown: FC<{
    isDashBoard?: boolean
    showImage?: boolean,
    onChangeNetwork: any,
    selectedChain: any,
    router?: any
    networks?: IChain[]
}> = ({ isDashBoard = true, showImage, onChangeNetwork, selectedChain, router, networks }) => {
    // const router = useRouter()
    const [isShowDropDown, setIsShowDropDown] = useState(false)


    const primaryButtonOption = () => (
        <button
            type="button"
            onClick={() => {
                setIsShowDropDown(!isShowDropDown)
            }}
            className={`flex justify-between px-4 gap-2 items-center ${isDashBoard ? 'min-w-[185px]' : ' w-full min-w-[135px]'
                } rounded-lg text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-grey-901 ${router?.pathname !== '/multisend' ? 'h-12 border border-[#D0D5DD]' : 'h-10 bg-white'
                }`}
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
        >
            {showImage && <Image src={ethImage} alt="ETH" height={20} width={20} className="w-auto h-4" />}
            <div className="flex items-center gap-2 w-full ">
                <div className="leading-4 text-left font-inter">
                    <p className="font-semibold text-[#374151] ">{selectedChain?.name}</p>
                    <p className="font-medium text-[#6B7280]">Network</p>
                </div>
            </div>
            <Image src={isDashBoard ? boxArrow : borderArrow} alt="ETH" height={20} width={20} className={isShowDropDown ? 'rotate-180 ' : ''} />
        </button>
    )
    return (
        <DropDown
            isShowDropDown={isShowDropDown}
            setIsShowDropDown={setIsShowDropDown}
            triggerButton={primaryButtonOption()}
            maxHeight="max-h-[50vh] "
        >
            {networks?.map((chain, index) => (
                <button
                    type="button"
                    className="w-full flex items-center px-4 h-10 disabled:cursor-pointer gap-2 whitespace-nowrap hover:bg-gray-50"
                    role="menuitem"
                    tabIndex={index}
                    id={`menu-item-${index}`}
                    key={chain.id}
                    onClick={() => onChangeNetwork(chain)}
                >
                    <div className="w-[20%]">
                        <Image src={ethImage} alt="ETH" height={20} width={20} className="w-auto h-4" />

                    </div>
                    <div className="flex w-full justify-between items-center">
                        <p className="font-inter text-sm  text-gray-700 leading-6 font-semibold truncate">{chain.name}</p>
                    </div>
                </button>
            ))}
        </DropDown>
    )
}

export default SwitchNetworkDropdown
