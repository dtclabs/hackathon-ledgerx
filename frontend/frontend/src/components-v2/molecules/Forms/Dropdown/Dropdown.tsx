/* eslint-disable no-unneeded-ternary */
import React from 'react'
import Image from 'next/legacy/image'
import Select, { StylesConfig } from 'react-select'
import CaretIcon from '@/public/svg/icons/caret-icon.svg'
import { scrollbarSelect } from '@/constants/styles'

interface DropdownProps {
  options: { value: string; label: string }[]

  showCaret?: boolean
  onChange?: (value: any) => void
  defaultValue?: { value: string; label: string }
  value?: { value: string; label: string }
  sizeVariant?: 'small' | 'medium' | 'large'
  placeholder?: string
  disabled?: boolean
  isSearchable?: boolean
  formatOptionLabel?: any
  id?: string
}

const Dropdown: React.FC<DropdownProps> = ({
  options,

  showCaret,
  onChange,
  defaultValue,
  value,
  sizeVariant,
  placeholder,
  disabled,
  isSearchable = false,
  formatOptionLabel,
  id
}) => {
  // Determine the class name for the select container based on the size variant
  const selectContainerClassName = 'relative w-full'

  const customStyles: StylesConfig = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state?.isDisabled ? '#F5F5F5' : '#FFF',
      borderColor: '#E5E7EB',

      boxShadow: 'none',
      '&:focus-within': {
        borderColor: '#EAECF0',
        boxShadow: '0 0 0.4rem #E5E7EB'
      },
      '&:hover': {
        borderColor: '#E5E7EB'
      },
      borderRadius: '0.375rem',
      fontSize: sizeVariant === 'small' ? '0.75rem' : sizeVariant === 'large' ? '1.25rem' : '0.875rem',
      height: sizeVariant === 'small' ? '40px' : sizeVariant === 'large' ? '55px' : '48px',
      lineHeight: '1.5',
      cursor: 'pointer'
    }),
    option: (provided, state) => ({
      ...provided,
      // whiteSpace: 'nowrap',
      fontSize: sizeVariant === 'small' ? '0.75rem' : sizeVariant === 'large' ? '1.25rem' : '1rem',
      fontWeight: 400,
      font: 'inter',
      backgroundColor: state.isSelected
        ? '#F5F5F5'
        : state.isFocused
        ? '#F3F4F6'
        : state.isDisabled
        ? '#F5F5F5'
        : '#FFF',

      color: state.isSelected ? '#344054' : state.isDisabled ? '#DCDCDE' : '#344054',
      cursor: 'pointer'
    }),
    groupHeading: (provided) => ({
      ...provided,
      background: '#E2E2E0',
      padding: '6px 8px',
      color: '#2D2D2C',
      fontSize: 12,
      fontWeight: 550
    }),
    group: (provided) => ({
      padding: '2px 0'
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      transition: 'transform 0.2s',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null
    }),
    menuList: (provided) => ({
      ...provided,
      ...scrollbarSelect
    })
  }

  return (
    <div className={selectContainerClassName}>
      <Select
        id={id}
        options={options}
        onChange={onChange}
        menuPlacement="auto"
        isDisabled={disabled}
        // menuPosition="fixed"
        styles={customStyles}
        value={value}
        isOptionDisabled={(option: any) => option.disabled}
        placeholder={placeholder}
        isSearchable={isSearchable}
        defaultValue={defaultValue}
        components={{
          DropdownIndicator: showCaret ? CaretIndicator : null
        }}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  )
}

const CaretIndicator = (props) => {
  const { selectProps, innerProps } = props
  const { menuIsOpen } = selectProps

  return (
    <div {...innerProps} className="flex justify-center items-center ml-2 mr-2">
      <div className="bg-slate-200 h-[20px] w-[20px] flex justify-center items-center">
        <Image
          src={CaretIcon}
          alt="caret"
          height={8}
          width={8}
          className={`${menuIsOpen ? 'rotate-180' : ''} transition-transform`}
        />
      </div>
    </div>
  )
}

export default Dropdown
