import { FC, useState } from 'react'
import { TextInput2, ITextInputProps } from '../TextInput'
import { Dropdown } from '@/components-v2/molecules/Forms/Dropdowns'
import { IBaseDropdownProps } from '../Dropdowns/BaseDropdown/base-config'

interface IOptionValue {
  value: string
  label: string
}

type ITextInputDropdown = ITextInputProps &
  IBaseDropdownProps & {
    onOptionChange: (_option: IOptionValue) => void
    onInputChange: any
  }

const TextInputDropdown: FC<ITextInputDropdown> = ({ placeholder, options, onOptionChange, onInputChange }) => {
  const handleOnOptionChange = (_e) => {
    onOptionChange(_e)
  }

  const handleOnInputChange = (_e) => {
    onInputChange(_e)
  }
  return (
    <div className="py-1 px-2 flex flex-row items-center gap-1 bg-slate-500">
      <div className="w-1/6">
        <Dropdown
          onChange={handleOnOptionChange}
          isSearchable={false}
          customStyles={{ borderRadius: '0px' }}
          showCaret
          size="sm"
          options={options}
        />
      </div>
      <div className="w-full">
        <TextInput2 onChange={handleOnInputChange} size="lg" extendedClass="!rounded-none" placeholder={placeholder} />
      </div>
    </div>
  )
}

export default TextInputDropdown
