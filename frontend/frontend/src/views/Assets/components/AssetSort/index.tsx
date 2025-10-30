import DropDown from '@/components/DropDown/DropDown'
import React, { useState } from 'react'
import Sort from '@/public/svg/Sort.svg'
import Dropdown from '@/public/svg/Dropdown.svg'
import Image from 'next/legacy/image'
import { sortData } from './data'

interface IAssetsSort {
  sortBy: any
  onSort: (sortBy: any) => void
}

const AssetsSort: React.FC<IAssetsSort> = ({ sortBy, onSort }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)

  const sortButton = () => (
    <button
      type="button"
      className={`text-sm w-[265px] font-medium text-grey-800 border border-grey-200 py-2 px-4 h-[34px] rounded flex justify-between items-center ${
        isShowDropDown && 'shadow-button'
      }`}
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
    >
      <div className="flex items-center">
        <Image src={Sort} alt="sort" />
        <div className="ml-[10px] mr-4">{sortBy?.value}</div>
      </div>
      <Image src={Dropdown} alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
    </button>
  )
  return (
    <div className="flex items-center">
      <DropDown isShowDropDown={isShowDropDown} setIsShowDropDown={setIsShowDropDown} triggerButton={sortButton()}>
        <div className="flex flex-col">
          {sortData &&
            sortData.length > 0 &&
            sortData.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`text-sm font-medium text-left text-grey-800 py-2 px-4 ${
                  sortBy?.value === item.value && 'bg-grey-200'
                } hover:bg-grey-200`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSort(item)
                  setIsShowDropDown(false)
                }}
              >
                {item.value}
              </button>
            ))}
        </div>
      </DropDown>
    </div>
  )
}

export default AssetsSort
