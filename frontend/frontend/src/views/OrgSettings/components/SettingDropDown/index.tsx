import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DropDown from '@/components/DropDown/DropDown'
import React, { useEffect, useState } from 'react'

interface ISettingDropDown {
  options: any[]
  selectedOption: any
  onSelect: (option: any) => void
}

const SettingDropDown: React.FC<ISettingDropDown> = ({ options, selectedOption, onSelect }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)

  const triggerButton = () => (
    <button
      type="button"
      className={`w-full h-12 flex items-center justify-between border p-[10px] rounded-lg focus:outline-none leading-5  ${
        isShowDropDown && 'shadow-button'
      }`}
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
    >
      <div>{selectedOption}</div>
      <div className="flex items-center">
        <DividerVertical className="border border-[#ccc]" height="h-4" />
        <div className="bg-[#F2F4F7] h-6 w-6 cursor-pointer flex justify-center items-center py-[6px] p-1 rounded-[4px] mr-0.5">
          <img
            src="/svg/Dropdown.svg"
            width={11.5}
            height={6.8}
            alt="DownArrow"
            className={isShowDropDown ? 'rotate-180 ' : ''}
          />
        </div>
      </div>
    </button>
  )

  return (
    <DropDown
      triggerButton={triggerButton()}
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      widthBtn="w-[400px]"
    >
      <div className="">
        {options &&
          options.length > 0 &&
          options?.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`w-full h-12 flex items-center p-[10px] leading-5 ${
                selectedOption === item.value ? 'bg-gray-100' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setIsShowDropDown(false)
                onSelect(item.value)
              }}
            >
              {item.label}
            </button>
          ))}
      </div>
    </DropDown>
  )
}
export default SettingDropDown
