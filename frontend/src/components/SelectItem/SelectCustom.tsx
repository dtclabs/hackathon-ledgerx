import { styleCustom } from '@/constants/styles'
import CustomIndicatorsContainer from '@/views/TransferApp/components/ReactSelectComponents/CustomIndicatorsContainer'
import FormatOptionLabelToken from '@/views/TransferApp/components/ReactSelectComponents/FormatOptionLabelToken'
import { IAddRecipientTransfer } from '@/views/TransferApp/interface'
import React, { useState } from 'react'
import { Control, UseFormSetValue } from 'react-hook-form'
import { InputActionMeta, MultiValue } from 'react-select'
import DropDown, { EPlacement } from '../DropDown/DropDown'
import CustomControl from './CustomControl'
import { IFormatOptionLabel } from './FormatOptionLabel'
import { SelectItem } from './SelectItem'
import Image from 'next/legacy/image'
import Dropdown from '@/public/svg/Dropdown.svg'

interface ISelectCustom {
  name: string
  control?: Control<IAddRecipientTransfer, any>
  placeholder?: string
  className?: string
  // onChange?: (newValue: IFormatOptionLabel) => void
  optionList: IFormatOptionLabel[]
  noOptionsMessage?: (obj: { inputValue: string }) => React.ReactNode
  onChangeToken?: (token: IFormatOptionLabel) => void
  index?: number
  setValue: UseFormSetValue<IAddRecipientTransfer>
  token: IFormatOptionLabel
  disabled?: boolean
}

const SelectCustom: React.FC<ISelectCustom> = ({
  name,
  placeholder,
  className,
  optionList,
  control,
  // onChange,
  noOptionsMessage,
  onChangeToken,
  index,
  setValue,
  token,
  disabled
}) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleShowDropDown = () => {
    setIsShowDropDown(!isShowDropDown)
  }
  const handleSelectToken = (value: IFormatOptionLabel | MultiValue<IFormatOptionLabel>) => {
    setIsShowDropDown(false)
    onChangeToken(value as IFormatOptionLabel)
    setValue(`recipients.${index}.token`, value as IFormatOptionLabel)
  }

  const primaryButtonOption = () => (
    <button
      type="button"
      className={`${
        className ||
        `flex items-center justify-between min-w-[120px] bg-[#FBFAFA] p-[10px] rounded border border-color-[#F1F1EF] focus:outline-none leading-5 ${
          disabled ? 'bg-[#FBFAFA] cursor-not-allowed' : ''
        }`
      }`}
      id="select-div"
      aria-expanded="true"
      aria-haspopup="true"
      onClick={handleShowDropDown}
      disabled={disabled}
    >
      <div className="flex gap-2 items-center justify-center text-sm text-grey-800">
        {token?.src && <img src={token.src} alt={token.label} className="h-4 w-auto" />}
        <div className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[60px]">{token?.label}</div>
      </div>
      {!disabled && (
        <div className="cursor-pointer flex justify-center items-center w-fit h-fit py-[6px] px-1 rounded-sm">
          <Image src={Dropdown} alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
        </div>
      )}
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
      placement={EPlacement.BOTTOMRIGHT}
    >
      <div className="w-[160px]">
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

export default SelectCustom
