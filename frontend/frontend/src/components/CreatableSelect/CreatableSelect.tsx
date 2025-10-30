import { FocusEventHandler, ReactNode } from 'react'
import { Controller } from 'react-hook-form'
import CaretIcon from '@/public/svg/icons/caret-icon.svg'
import CreatableSelectBase from 'react-select/creatable'
import {
  ActionMeta,
  FormatOptionLabelMeta,
  GroupBase,
  MenuPlacement,
  MenuPosition,
  MultiValue,
  Options,
  OptionsOrGroups,
  PropsValue,
  StylesConfig
} from 'react-select'
import { SelectComponents } from 'react-select/dist/declarations/src/components/index'
import { Accessors } from 'react-select/dist/declarations/src/useCreatable'
import Image from 'next/legacy/image'
// export type IFormatOption = SelectOption & IOptional
export type IFormatOption = {
  value: string
  label: string
  __isNew__?: boolean
  //   options?: T[]
}
// export interface IOptional<T>{
//     options: T
// }

interface CreatableSelectProps {
  control?: any
  name: string
  options: OptionsOrGroups<IFormatOption, GroupBase<IFormatOption>>
  isMulti?: boolean
  maxHeight?: number
  isSearchable?: boolean
  customStyles?: StylesConfig<IFormatOption, boolean, GroupBase<IFormatOption>>
  formatOptionLabel?: (data: IFormatOption, formatOptionLabelMeta: FormatOptionLabelMeta<IFormatOption>) => ReactNode
  defaultValue?: PropsValue<IFormatOption>
  placeholder?: string
  value?: PropsValue<IFormatOption>
  onChange?: (newValue: IFormatOption | MultiValue<IFormatOption>, actionMeta: ActionMeta<IFormatOption>) => void
  onBlur?: FocusEventHandler<HTMLInputElement>
  components?: Partial<SelectComponents<IFormatOption, boolean, GroupBase<IFormatOption>>>
  autoFocus?: boolean
  backspaceRemovesValue?: boolean
  controlShouldRenderValue?: boolean
  hideSelectedOptions?: boolean
  isClearable?: boolean
  menuIsOpen?: boolean
  menuPlacement?: MenuPlacement
  tabSelectsValue?: boolean
  noOptionsMessage?: (obj: { inputValue: string }) => ReactNode
  disabled?: boolean
  captureMenuScroll?: boolean
  menuPosition?: MenuPosition
  menuShouldScrollIntoView?: boolean
  menuPortalTarget?: HTMLElement
  isOptionDisabled?: (option: IFormatOption, selectValue: Options<IFormatOption>) => boolean
  createOptionPosition?: 'first' | 'last'
  formatCreateLabel?: (inputValue: string) => ReactNode
  isValidNewOption?: (
    inputValue: string,
    value: Options<IFormatOption>,
    options: OptionsOrGroups<IFormatOption, GroupBase<IFormatOption>>
  ) => boolean
  onCreateOption?: (inputValue: string) => void
  sizeVariant?: 'small' | 'medium' | 'large'
  scrollbarSelect?: any
  onInputChange?: (value: string) => void
  isLoading?: boolean
}

export const CreatableSelect = ({
  name,
  options,
  isMulti,
  isSearchable,
  maxHeight,
  customStyles,
  control,
  defaultValue,
  placeholder,
  value,
  components,
  autoFocus,
  backspaceRemovesValue,
  controlShouldRenderValue,
  hideSelectedOptions,
  isClearable,
  menuIsOpen,
  menuPlacement,
  tabSelectsValue,
  formatOptionLabel,
  onChange,
  onBlur,
  noOptionsMessage,
  disabled,
  captureMenuScroll,
  menuPosition,
  menuShouldScrollIntoView,
  menuPortalTarget,
  isOptionDisabled,
  createOptionPosition,
  formatCreateLabel,
  isValidNewOption,
  onCreateOption,
  onInputChange,
  sizeVariant,
  isLoading,
  scrollbarSelect
}: CreatableSelectProps): JSX.Element => {
  const customStyles2: any = {
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

  return control ? (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CreatableSelectBase
          ref={field.ref}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          formatOptionLabel={formatOptionLabel}
          defaultValue={defaultValue}
          id={name}
          components={components}
          options={options}
          isMulti={isMulti}
          styles={customStyles}
          isSearchable={isSearchable}
          maxMenuHeight={maxHeight}
          menuPlacement={menuPlacement}
          placeholder={placeholder}
          autoFocus={autoFocus}
          backspaceRemovesValue={backspaceRemovesValue}
          controlShouldRenderValue={controlShouldRenderValue}
          hideSelectedOptions={hideSelectedOptions}
          isClearable={isClearable}
          menuIsOpen={menuIsOpen}
          tabSelectsValue={tabSelectsValue}
          noOptionsMessage={noOptionsMessage}
          isDisabled={disabled}
          captureMenuScroll={captureMenuScroll}
          menuPosition={menuPosition}
          menuShouldScrollIntoView={menuShouldScrollIntoView}
          menuPortalTarget={menuPortalTarget}
          isOptionDisabled={isOptionDisabled}
          createOptionPosition={createOptionPosition}
          formatCreateLabel={formatCreateLabel}
          isValidNewOption={isValidNewOption}
          onCreateOption={onCreateOption}
        />
      )}
    />
  ) : (
    <CreatableSelectBase
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      formatOptionLabel={formatOptionLabel}
      defaultValue={defaultValue}
      id={name}
      components={{
        DropdownIndicator: CaretIndicator
      }}
      onInputChange={onInputChange}
      options={options}
      isMulti={isMulti}
      styles={customStyles2}
      isSearchable={isSearchable}
      maxMenuHeight={maxHeight}
      menuPlacement={menuPlacement}
      placeholder={placeholder}
      autoFocus={autoFocus}
      backspaceRemovesValue={backspaceRemovesValue}
      controlShouldRenderValue={controlShouldRenderValue}
      hideSelectedOptions={hideSelectedOptions}
      isClearable={isClearable}
      menuIsOpen={menuIsOpen}
      isLoading={isLoading}
      tabSelectsValue={tabSelectsValue}
      noOptionsMessage={noOptionsMessage}
      isDisabled={disabled}
      captureMenuScroll={captureMenuScroll}
      menuPosition={menuPosition}
      menuShouldScrollIntoView={menuShouldScrollIntoView}
      menuPortalTarget={menuPortalTarget}
      isOptionDisabled={isOptionDisabled}
      createOptionPosition={createOptionPosition}
      formatCreateLabel={formatCreateLabel}
      isValidNewOption={isValidNewOption}
      onCreateOption={onCreateOption}
    />
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
  
