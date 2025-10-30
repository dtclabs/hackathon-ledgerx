import React from 'react'

import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'

interface ISelectOption {
  option: string
  setOption: (token: string) => void
  optionList: any[]
}

const SelectOption: React.FC<ISelectOption> = ({ option, optionList, setOption }) => (
  <NewFilterDropDown
    position="bottom"
    width="w-full"
    triggerButton={
      <div className="w-full bg-[#FBFAFA] rounded border-[#EAECF0] border capitalize text-left p-3 flex justify-between items-center text-[#344054] text-sm font-medium">
        <div className="flex items-center gap-3">{option}</div>
        <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
      </div>
    }
  >
    <div className="max-h-[240px] overflow-auto scrollbar">
      {optionList &&
        optionList.map((item) => (
          <button
            type="button"
            key={item.name}
            onClick={() => {
              setOption(item.name)
            }}
            className="text-grey-800 bg-white w-full  p-2 capitalize text-sm text-left hover:bg-gray-50 font-inter "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">{item.name as string}</div>
              <div>
                {option && item.name === option && (
                  <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                )}
              </div>
            </div>
          </button>
        ))}
    </div>
  </NewFilterDropDown>
)

export default SelectOption
