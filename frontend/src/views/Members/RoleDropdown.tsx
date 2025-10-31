/* eslint-disable react/no-array-index-key */
import { FC } from 'react'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import { SelectItem } from '@/components/SelectItem/SelectItem'

interface IOption {
  value: string
  label: string
}

interface IProps {
  options: IOption[]
  value: string
  onChange: any
  disabled: boolean
}

const RoleDropdown: FC<IProps> = ({ options, value, onChange, disabled }) => {
  const handleOnChange = (x) => () => {
    onChange({ value: x.value })
  }
  // return (
  //   <SelectItem
  //     disabled={disabled}
  //     name="role"
  //     onChange={handleOnChange}
  //     options={options}
  //     value={{ value, label: value }}
  //   />
  // )
  return (
    <NewFilterDropDown
      width="w-full focus:shadow-wallet rounded-lg"
      disabled={disabled}
      triggerButton={
        <div
          className={`${
            disabled && 'cursor-not-allowed'
          } bg-grey-100 flex items-center justify-between w-full h-[48px] py-2 px-4 text-sm text-dashboard-main rounded-md focus:outline-none leading-5 ${
            disabled ? 'border-none' : 'border  border-blanca-300 '
          }`}
        >
          <div className="text-grey-700">{value}</div>
          <div
            className={`${
              disabled ? '' : 'cursor-pointer '
            }flex justify-between items-center w-fit h-fit py-[10px] px-2 rounded-sm flex-shrink-0`}
          >
            {!disabled && <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />}
          </div>
        </div>
      }
    >
      <div className="max-h-[200px] overflow-y-auto scrollbar">
        {options?.map((item, index) => (
          <button
            type="button"
            key={index}
            onClick={handleOnChange(item)}
            className="text-gray-700 flex justify-between items-center bg-white w-full h-[48px] py-2 px-4 capitalize text-sm text-left hover:bg-grey-100 font-inter"
          >
            {item.label}
            {/* {selectType === item && <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4" />} */}
          </button>
        ))}
      </div>
    </NewFilterDropDown>
  )
}

export default RoleDropdown
