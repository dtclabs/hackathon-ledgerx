import warning from '@/assets/svg/warning.svg'
import Image from 'next/legacy/image'
import React from 'react'
import { Controller, FieldErrorsImpl } from 'react-hook-form'
import Close from '@/public/svg/CloseGray.svg'
import searchIcon from '@/assets/svg/search.svg'

interface ITextField {
  name: string
  placeholder?: string
  control?: any
  label?: string
  classNameLabel?: string
  classNameInput?: string
  required?: boolean
  rules?: any
  extendInputClassName?: string
  errors?: FieldErrorsImpl<{
    [x: string]: any
  }>
  message?: string
  value?: string | number
  multiline?: boolean
  rows?: number
  cols?: number
  type?: React.HTMLInputTypeAttribute
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onChangeTextArea?: React.ChangeEventHandler<HTMLTextAreaElement>
  onWheel?: React.WheelEventHandler<HTMLInputElement>
  disabled?: boolean
  classNameContainer?: string
  handleReset?: () => void
  search?: boolean
  style?: any
  errorClass?: string
  textSearch?: string
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  inputRef?: React.MutableRefObject<any>
  defaultValue?: string
}

const TextField: React.FC<ITextField> = ({
  control,
  name,
  placeholder,
  label,
  classNameLabel,
  classNameInput,
  required,
  rules,
  errors,
  extendInputClassName,
  message,
  value,
  multiline,
  cols,
  rows,
  style,
  type = 'text',
  onChange,
  onBlur,
  onFocus,
  onChangeTextArea,
  onWheel,
  disabled,
  classNameContainer,
  search = false,
  handleReset,
  textSearch,
  errorClass,
  onKeyDown,
  inputRef,
  defaultValue,
  ...rest
}) =>
  control ? (
    <Controller
      render={({ field }) =>
        classNameContainer ? (
          <div className={classNameContainer}>
            {label && (
              <div className={`${classNameLabel || 'pb-4 text-sm font-inter font-medium text-[#344054] '}`}>
                {label}
              </div>
            )}

            {multiline ? (
              <textarea
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                rows={rows}
                cols={cols}
                placeholder={placeholder}
                style={{ resize: 'none' }}
                className={`${
                  classNameInput ||
                  `focus:outline-none border-grey-200 text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter border rounded p-4 ${extendInputClassName}`
                } `}
                disabled={disabled}
              />
            ) : (
              <div className="flex items-center border-grey-200 border rounded w-full">
                {search && (
                  <div className="flex pl-4 items-center">
                    <Image src={searchIcon} width={12} height={12} />
                  </div>
                )}
                <input
                  {...rest}
                  className={`${
                    classNameInput ||
                    `focus:outline-none focus:shadow-inputField text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full h-12 font-inter  flex gap-4 items-center px-4 ${extendInputClassName}`
                  } `}
                  ref={field.ref}
                  name={name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={placeholder}
                  onFocus={onFocus}
                  type={type}
                  onWheel={onWheel}
                  disabled={disabled}
                  onKeyDown={onKeyDown}
                />
                {textSearch && (
                  <div className="pr-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
                    >
                      <Image src={Close} alt="close" height={10} width={10} />
                    </button>
                  </div>
                )}
              </div>
            )}
            {errors?.[name] && (
              <div className={`text-sm font-inter pt-1 flex items-center text-[#E83F6D] ${errorClass}`}>
                <div className="mr-2 flex items-center">
                  <Image src={warning} alt="warning" />
                </div>
                {errors?.[name]?.message.toString() || message}
              </div>
            )}
          </div>
        ) : (
          <>
            {label && (
              <div className={`${classNameLabel || 'pb-4 text-sm font-inter font-medium text-[#344054] '}`}>
                {label}
              </div>
            )}

            {multiline ? (
              <textarea
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                rows={rows}
                cols={cols}
                placeholder={placeholder}
                style={{ resize: 'none' }}
                className={`${
                  classNameInput ||
                  `focus:outline-none border-grey-200 text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter border rounded p-4 ${extendInputClassName}`
                } `}
                disabled={disabled}
              />
            ) : (
              <input
                {...rest}
                className={`${
                  classNameInput ||
                  `focus:outline-none focus:shadow-inputField border-grey-200 text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5  w-full h-12 font-inter border rounded flex gap-4 items-center px-4 ${extendInputClassName}`
                } `}
                name={name}
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={placeholder}
                onFocus={onFocus}
                type={type}
                onWheel={onWheel}
                disabled={disabled}
                onKeyDown={onKeyDown}
              />
            )}
            {errors?.[name] && (
              <div className={`text-sm font-inter flex items-center text-[#E83F6D] ${errorClass}`}>
                <div className="mr-2 flex items-center">
                  <Image src={warning} alt="warning" />
                </div>
                {errors?.[name]?.message.toString() || message}
              </div>
            )}
          </>
        )
      }
      name={name}
      control={control}
      rules={{ required: { value: required, message: 'This field is required.' }, ...rules }}
    />
  ) : (
    <>
      {label && (
        <div className={`${classNameLabel || 'pb-4 text-sm font-inter font-medium text-[#344054] '}`}>{label}</div>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChangeTextArea}
          rows={rows}
          cols={cols}
          placeholder={placeholder}
          style={{ resize: 'none' }}
          className={`${
            classNameInput ||
            `focus:outline-none border-grey-200 text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter border rounded p-4 ${extendInputClassName}`
          } `}
          disabled={disabled}
          defaultValue={defaultValue}
        />
      ) : (
        <input
          {...rest}
          ref={inputRef}
          className={`${
            classNameInput ||
            `focus:outline-none focus:shadow-inputField border-grey-200 text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5  w-full h-12 font-inter border rounded flex gap-4 items-center px-4 ${extendInputClassName}`
          } `}
          value={value}
          style={style}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          onFocus={onFocus}
          type={type}
          onWheel={onWheel}
          disabled={disabled}
          defaultValue={defaultValue}
        />
      )}
      {errors?.[name] && (
        <div className={`text-sm font-inter flex items-center text-[#E83F6D] ${errorClass}`}>
          <div className="mr-2 flex items-center">
            <Image src={warning} alt="warning" />
          </div>
          {errors?.[name]?.message.toString() || message}
        </div>
      )}
    </>
  )

export default TextField
