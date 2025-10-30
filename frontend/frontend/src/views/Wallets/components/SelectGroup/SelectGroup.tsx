import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { useAppSelector } from '@/state'

interface ISelectGroup {
  group?: any
  groupList?: any[]
  className?: string
  maxWidth?: string
  onSelect?: (item: any) => void
  fullWidth?: boolean
  top?: boolean
}
const SelectGroup: React.FC<ISelectGroup> = ({ top, fullWidth, group, className, onSelect, groupList, maxWidth }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)

  const triggerButton = () => (
    <div data-tip="selectGroup" data-for="selectGroup">
      <button
        disabled={isWalletSyncing}
        type="button"
        className={`${
          group ? 'bg-grey-100' : 'bg-white'
        } flex items-center justify-between w-full p-[10px] rounded-lg focus:outline-none leading-5 border border-blanca-300 disabled:cursor-not-allowed disabled:opacity-50 ${className} ${maxWidth}
        ${isShowDropDown && 'shadow-button'}`}
        onClick={(e) => {
          e.stopPropagation()
          setIsShowDropDown(!isShowDropDown)
        }}
      >
        {group && <div className="flex items-center text-sm text-neutral-900">{group.name}</div>}
        <div className="cursor-pointer flex justify-between items-center w-fit h-fit py-[6px] px-1 rounded-sm flex-shrink-0">
          <img src="/svg/Dropdown.svg" alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
        </div>
      </button>
      {/* eslint-disable quotes */}
      {isWalletSyncing && (
        <ReactTooltip
          id="selectGroup"
          place="top"
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg !text-xs max-w-[244px]"
        >
          We are syncing transactions data. You will be able to change the wallet group after the sync is completed.
        </ReactTooltip>
      )}
    </div>
  )
  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={triggerButton()}
      maxHeight="max-h-[400px]"
      placement={top ? EPlacement.TOPRIGHT : EPlacement.BOTTOMRIGHT}
      widthBtn={fullWidth ? 'w-full' : 'w-[235px]'}
      position={top ? 'top' : 'bottom'}
      bottomPosition={top && 'bottom-[54px]'}
    >
      <div className="w-full flex flex-col">
        {groupList &&
          groupList.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()
                setIsShowDropDown(false)
                onSelect(item)
              }}
              className={`text-gray-700 flex justify-between items-center bg-white w-full h-[42px] py-2 px-4 truncate text-sm text-left hover:bg-grey-100 font-inter disabled:cursor-not-allowed ${
                item.id === group.id && 'bg-grey-200'
              }`}
            >
              {item.name}
            </button>
          ))}
      </div>
    </DropDown>
  )
}

export default SelectGroup
