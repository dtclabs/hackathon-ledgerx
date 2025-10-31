import { FocusEventHandler, ReactNode, useRef } from 'react'
import { Controller } from 'react-hook-form'
import Select, {
  ActionMeta,
  FormatOptionLabelMeta,
  GroupBase,
  InputActionMeta,
  MenuPlacement,
  MenuPosition,
  MultiValue,
  Options,
  OptionsOrGroups,
  PropsValue,
  StylesConfig
} from 'react-select'
import { SelectComponents } from 'react-select/dist/declarations/src/components/index'
import { IFormatOptionLabel } from './FormatOptionLabel'
import CustomMenuList from './MenuList'
import { useOutsideClick } from '@/hooks/useOutsideClick'

export type SelectOption = {
  value: string
  label: string
  address?: number
}

interface SelectItemProps {
  control?: any
  name: string
  options: OptionsOrGroups<IFormatOptionLabel, GroupBase<IFormatOptionLabel>>
  isMulti?: boolean
  maxHeight?: number
  isSearchable?: boolean
  customStyles?: StylesConfig<IFormatOptionLabel, boolean, GroupBase<IFormatOptionLabel>>
  formatOptionLabel?: (
    data: IFormatOptionLabel,
    formatOptionLabelMeta: FormatOptionLabelMeta<IFormatOptionLabel>
  ) => ReactNode
  defaultValue?: PropsValue<IFormatOptionLabel>
  placeholder?: string
  value?: PropsValue<IFormatOptionLabel>
  onChange?: (
    newValue: IFormatOptionLabel | MultiValue<IFormatOptionLabel>,
    actionMeta: ActionMeta<IFormatOptionLabel>
  ) => void
  onBlur?: FocusEventHandler<HTMLInputElement>
  components?: Partial<SelectComponents<IFormatOptionLabel, boolean, GroupBase<IFormatOptionLabel>>>
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
  isOptionDisabled?: (option: IFormatOptionLabel, selectValue: Options<IFormatOptionLabel>) => boolean
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void
  inputValue?: string
  isInvalid?: boolean
  manualOpen?: boolean
  onToggle?: () => void
  onMenuClose?: () => void
}

export const SelectItem = ({
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
  onInputChange,
  inputValue,
  isInvalid,
  manualOpen,
  onToggle,
  onMenuClose
}: SelectItemProps): JSX.Element => {
  const wrapperRef = useRef(null)

  useOutsideClick(wrapperRef, () => {
    if (onMenuClose && manualOpen) onMenuClose()
  })

  return (
    <div
      aria-hidden
      ref={wrapperRef}
      onClick={() => {
        if (manualOpen && onToggle && !disabled) {
          onToggle()
        }
      }}
    >
      {control ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
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
              onInputChange={onInputChange}
              isInvalid={isInvalid}
              inputValue={inputValue}
            />
          )}
        />
      ) : (
        <Select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
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
          onInputChange={onInputChange}
          inputValue={inputValue}
          isInvalid={isInvalid}
          openMenuOnClick={!manualOpen}
        />
      )}
    </div>
  )
}
