import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import CustomControl from '@/components/SelectItem/CustomControl'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import { styleCustom } from '@/constants/styles'
import CustomIndicatorsContainer from '@/views/TransferApp/components/ReactSelectComponents/CustomIndicatorsContainer'
import FormatOptionLabelToken from '@/views/TransferApp/components/ReactSelectComponents/FormatOptionLabelToken'
import React, { useState } from 'react'
import { InputActionMeta } from 'react-select'

interface ISelectToken {
  name: string
  placeholder?: string
  className?: string
  optionList: IFormatOptionLabel[]
  noOptionsMessage?: (obj: { inputValue: string }) => React.ReactNode
  onChangeToken?: (token: IFormatOptionLabel) => void
  setValue: any
  token?: IFormatOptionLabel
}

const SelectToken: React.FC<ISelectToken> = ({
  name,
  placeholder,
  className,
  optionList,
  noOptionsMessage,
  onChangeToken,
  setValue,
  token
}) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleShowDropDown = () => {
    setIsShowDropDown(!isShowDropDown)
  }
  const handleSelectToken = (value: any) => {
    setIsShowDropDown(false)
    onChangeToken(value as IFormatOptionLabel)
    setValue('token', value.value)
  }

  const primaryButtonOption = () => (
    <button
      type="button"
      className={`${
        className ||
        `w-full h-12 flex items-center justify-between border p-[10px] rounded-lg focus:outline-none leading-5 ${
          isShowDropDown && 'shadow-button'
        }`
      }`}
      id="select-div"
      aria-expanded="true"
      aria-haspopup="true"
      onClick={handleShowDropDown}
    >
      {token ? (
        <div className="flex gap-2 items-center justify-center text-sm text-grey-800">
          {token?.src && <img src={token.src} alt={token.label} className="h-4 w-auto" />}
          <div>{token?.label}</div>
        </div>
      ) : (
        <div className="text-[#98A2B3]">Select an asset</div>
      )}
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
  const handleInputChange = (newValue: string, actionMeta: InputActionMeta) => {
    // if (actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') {
    //   setInputValue('')
    // }
    if (actionMeta.action === 'input-change') {
      setInputValue(newValue)
    }
  }
  const handleClose = () => {
    setInputValue('')
  }
  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={primaryButtonOption()}
      maxHeight="max-h-[50vh]"
      width="w-full"
      widthBtn="w-full"
      placement={EPlacement.BOTTOMRIGHT}
    >
      <div className="w-full">
        <SelectItem
          name={name}
          options={optionList}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: () => null,
            IndicatorsContainer: (props) => CustomIndicatorsContainer(props, handleClose, inputValue),
            Control: CustomControl
          }}
          customStyles={styleCustom}
          formatOptionLabel={FormatOptionLabelToken}
          backspaceRemovesValue={false}
          controlShouldRenderValue={false}
          hideSelectedOptions={false}
          isClearable={false}
          menuIsOpen
          tabSelectsValue={false}
          value={token}
          placeholder={placeholder}
          autoFocus
          onChange={handleSelectToken}
          noOptionsMessage={noOptionsMessage}
          onInputChange={handleInputChange}
          inputValue={inputValue}
        />
      </div>
    </DropDown>
  )
}

export default SelectToken
