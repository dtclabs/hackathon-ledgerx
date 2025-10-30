import { scrollbarSelect } from '@/constants/styles'
import { ReactElement, FC, useState } from 'react'
import Select, { StylesConfig, GroupBase, MenuPlacement } from 'react-select'

interface ISelectDropdown {
  disabled?: boolean
  options: any
  defaultValue?: any
  name: string
  onChange?: any
  customBorder?: any
  disableIndicator?: boolean
  className?: any
  styles?: any
  value?: any
  menuPlacement?: MenuPlacement
  formatOptionLabel?: any
  tabelRef?: any
  isSearchable?: boolean
  customComponents?: any
  isMulti?: boolean
  closeMenuOnSelect?: boolean
  placeholder?: string | ReactElement
  menuIsOpen?: boolean
  onClick?: (e) => void
}

declare module 'react-select/dist/declarations/src/Select' {
  export interface Props<Option, IsMulti extends boolean, Group extends GroupBase<Option>> {
    customBorder?: string
    disableIndicator?: any
    isInvalid?: boolean
  }
}

const SelectDropdown: FC<ISelectDropdown> = ({
  options,
  defaultValue,
  disabled,
  name,
  onChange,
  customBorder,
  disableIndicator,
  className,
  value,
  menuPlacement,
  tabelRef,
  formatOptionLabel,
  isSearchable = false,
  customComponents,
  closeMenuOnSelect = true,
  isMulti = false,
  placeholder,
  menuIsOpen,
  onClick,
  ...rest
}) => {
  const [placement, setPlacement] = useState<MenuPlacement>(menuPlacement || 'bottom')

  const getMenuPlacement = (inputEl) => {
    if (tabelRef && inputEl) {
      const rowRect = inputEl.getBoundingClientRect()
      const tableRect = tabelRef.current.getBoundingClientRect()
      const rowAbsolutePosition = rowRect.top - tableRect.top

      if (rowAbsolutePosition < 250 || tableRect.height - rowAbsolutePosition > 190) {
        setPlacement('bottom')
      } else {
        setPlacement('top')
      }
    }
  }

  return (
    <Select
      className={`basic-single ${className}`}
      isMulti={isMulti}
      closeMenuOnSelect={closeMenuOnSelect}
      classNamePrefix="select"
      defaultValue={defaultValue}
      isDisabled={disabled}
      isSearchable={isSearchable}
      name={name}
      isOptionDisabled={(option: any) => option.disabled}
      options={options}
      styles={customStyle}
      onChange={onChange}
      disableIndicator={disableIndicator}
      customBorder={customBorder}
      value={value}
      menuPlacement={placement}
      formatOptionLabel={formatOptionLabel}
      components={customComponents}
      placeholder={placeholder}
      menuIsOpen={menuIsOpen}
      onFocus={(e) => {
        if (tabelRef) getMenuPlacement(e.target)
        if (onClick) onClick(e)
      }}
      {...rest}
    />
  )
}

export default SelectDropdown

export const customStyle: StylesConfig<any, any> = {
  control: (provided, { isFocused, selectProps, isDisabled, isMulti, hasValue }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: '#EAECF0',
      backgroundColor: (!isMulti || !hasValue) && '#F3F4F6'
    },
    borderColor: '#EAECF0',
    backgroundColor: isDisabled ? '#FBFAFA' : '#FFF',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    borderRadius: selectProps.customBorder ? selectProps.customBorder : 4,
    minHeight: 48,
    height: 'fit-content'
  }),

  option: (provided, { isFocused, isSelected, isDisabled }) => ({
    ...provided,
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : '',
    color: isSelected ? '#344054' : isFocused ? '#344054' : '',
    fontSize: 14,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.4 : 1
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    fontSize: 14,
    lineHeight: '20px'
  }),

  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    color: state.isDisabled ? '#CECECC' : '#B5B5B3'
  }),
  indicatorSeparator: (provided, { selectProps }) => ({
    ...provided,
    height: selectProps.disableIndicator ? 0 : 12,
    margin: 'auto 0'
  }),
  dropdownIndicator: (provided, { selectProps }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : '',
    background: '#F2F4F7',
    color: '#878787',
    borderRadius: 4,
    margin: 12,
    padding: 2
  }),

  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 10
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#F2F4F7',
    borderRadius: '4px'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#777675',
    '&:hover': {
      backgroundColor: '#F2F4F7',
      color: '#000000'
    }
  })
}
