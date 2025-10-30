/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { forwardRef } from 'react'
import Image from 'next/legacy/image'
import CloseIcon from '@/public/svg/action-icon/close-icon.svg'

export interface ITextInputProps {
  extendedClass?: string
  placeholder?: string
  onChange?: (e: any) => void
  id?: string
  value?: string
  register?: any
  onClickClear?: () => void
  size?: 'sm' | 'md' | 'lg'
  leadingIcon?: any
  trailingIcon?: any
}

const sizeStyles = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg'
}

const iconSize = {
  sm: '16',
  md: '20',
  lg: '24'
}

const TextInput = forwardRef<HTMLInputElement, ITextInputProps>(
  ({ extendedClass, id, onClickClear, value = '', size = 'md', leadingIcon, trailingIcon, ...rest }, ref) => {
    const showClearIcon = value.length > 0
    const inputSizeClass = sizeStyles[size] || sizeStyles.md
    const iconDimensions = iconSize[size]

    // Adjust the padding for the clear icon if trailing icon is also present
    const clearIconPaddingRight = trailingIcon ? `pr-${parseInt(iconDimensions, 10) + 8}` : 'pr-3'

    const handleClearClick = () => {
      if (onClickClear) onClickClear()
    }

    return (
      <div className={`relative flex items-center ${inputSizeClass}`}>
        {leadingIcon && (
          <div className="absolute left-0 pl-3 flex items-center justify-center h-full">
            <Image
              src={leadingIcon}
              alt="Leading Icon"
              width={parseFloat(iconDimensions)}
              height={parseFloat(iconDimensions)}
            />
          </div>
        )}
        <input
          type="text"
          id={id}
          ref={ref as any}
          name={id}
          value={value}
          {...rest}
          className={`${extendedClass} py-1 border-2 border-[#F1F1EF] rounded-md w-full focus:border-[#E2E2E0] ring-[#E2E2E0] focus:ring-1 focus:outline-none ${
            leadingIcon ? `pl-${parseInt(iconDimensions, 10) + 8}` : 'pl-2'
          } pr-10`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {showClearIcon && (
            <div
              onClick={handleClearClick}
              className={`cursor-pointer flex items-center z-10 ${clearIconPaddingRight}`}
            >
              <Image
                src={CloseIcon}
                alt="Close Icon"
                width={parseFloat(iconDimensions)}
                height={parseFloat(iconDimensions)}
              />
            </div>
          )}
          {trailingIcon && (
            <div className={`pr-3 flex items-center ${showClearIcon ? 'pl-3' : ''}`}>
              <Image
                src={trailingIcon}
                alt="Trailing Icon"
                width={parseFloat(iconDimensions)}
                height={parseFloat(iconDimensions)}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
)

export default TextInput
