import React, { useState } from 'react'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'

interface ISelectChain {
  name: string
  optionList: IFormatOptionLabel[]
  onChangeChain: (chainValue: IFormatOptionLabel) => void
  setValue: any
  chain: any
}

const SelectChain: React.FC<ISelectChain> = ({ name, onChangeChain, optionList, chain, setValue }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const handleShowDropDown = () => {
    setIsShowDropDown(!isShowDropDown)
  }

  return (
    <NewFilterDropDown
      disabled
      width="w-full"
      triggerButton={
        <button
          type="button"
          className="w-full h-12 bg-[#FBFAFA] flex items-center justify-between border p-[10px] rounded-lg focus:outline-none leading-5"
          onClick={handleShowDropDown}
        >
          <div>{chain.label} Mainnet</div>
          <div className="flex items-center">
            <DividerVertical className="border border-[#ccc]" height="h-4" />
            <div className="bg-[#F2F4F7] h-6 w-6 cursor-pointer flex justify-center items-center py-[6px] p-1 rounded-[4px] mr-0.5">
              <img
                src="/svg/Dropdown.svg"
                width={11.5}
                height={6.8}
                alt="DownArrow"
                //   className={isShowDropDown ? 'rotate-180 ' : ''}
              />
            </div>
          </div>
        </button>
      }
    >
      <div>
        {optionList?.map((item) => (
          <div key={item.value}>{item.label}</div>
        ))}
      </div>
    </NewFilterDropDown>
  )
}

export default SelectChain
