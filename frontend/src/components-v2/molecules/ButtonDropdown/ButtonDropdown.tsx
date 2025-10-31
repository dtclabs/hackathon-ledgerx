/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import React, { useRef, useReducer } from 'react'
import Image from 'next/legacy/image'
import Button, { IButtonProps } from '@/components-v2/atoms/Button'
import WhiteCaretIcon from '@/public/svg/icons/caret-icon-white.svg'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { ButtonCtx, initialState, buttonReducer, useBtnHook } from './button-dropdown-ctx'
import BlackLockIcon from '@/public/svg/icons/black-lock-icon.svg'

interface IOption {
  label: string
  value: string
  icon?: any
  className?: string
  disabled?: boolean
  locked?: boolean
}

interface ChildProps {
  children: React.ReactNode
  id?: string
}

interface IOptionsProps {
  children?: React.ReactNode
  options: IOption[]
  onClick?: any
  extendedClass?: string
}
interface DropdownWithChildren extends React.FC<ChildProps> {
  CTA: React.FC<Partial<IButtonProps & { caretIcon?: any }>>
  Options: React.FC<IOptionsProps>
}

/* Component Level: Core Wrapper */
const ButtonDropdown: DropdownWithChildren = ({ children, id }) => {
  const [state, dispatch] = useReducer(buttonReducer, { ...initialState, id })
  return (
    <ButtonCtx.Provider value={{ state, dispatch }}>
      <div className="relative">{children}</div>
    </ButtonCtx.Provider>
  )
}

const BUTTON_DROPDOWN_CLASSNAME = 'button-dropdown'

export const Options: React.FC<IOptionsProps> = ({ onClick, options, extendedClass }) => {
  const { isOpen, setIsIsOpen, id } = useBtnHook()

  const wrapperRef = useRef(null)
  useOutsideClick(
    wrapperRef,
    () => {
      setIsIsOpen(false)
    },
    `${BUTTON_DROPDOWN_CLASSNAME}-${id}`
  )

  const handleOnClickOption = (_option) => (e) => {
    e.stopPropagation()
    setIsIsOpen(false)
    if (onClick) {
      onClick(_option)
    }
  }
  return isOpen ? (
    <div
      ref={wrapperRef}
      style={{ zIndex: 1000 }}
      className={`${extendedClass} absolute top-10 mt-2 right-0 rounded-md shadow-lg bg-white border`}
    >
      <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {options.map((option, index) => (
          <div
            key={index}
            className={`flex flex-row w-full min-w-max pt-1 pb-1 hover:bg-gray-100 hover:text-gray-900 ${
              option?.disabled ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            {option?.icon && (
              <div className="w-[25px] flex items-center pl-3">
                <Image src={option.icon} height={12} width={12} />
              </div>
            )}
            <button
              className={`${option.className} ${
                option?.disabled ? 'cursor-not-allowed' : ''
              } flex items-center gap-2 w-full px-3 py-2 text-start text-sm text-gray-700 whitespace-nowrap basis-3/4  flex-1 `}
              role="menuitem"
              type="button"
              disabled={option?.disabled}
              onClick={handleOnClickOption(option)}
            >
              {option.label}
              {option?.locked && <Image src={BlackLockIcon} width={14} height={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  ) : null
}

/* Component Level: White Card Content */
export const CTA: React.FC<Partial<IButtonProps & { caretIcon?: any }>> = ({
  label,
  variant = 'black',
  height = 40,
  leadingIcon,
  trailingIcon,
  classNames,
  caretIcon,
  disabled
}) => {
  const { setIsIsOpen, isOpen, id } = useBtnHook()

  const toggleDropdown = () => {
    setIsIsOpen(!isOpen)
  }

  const handleOnClick = (e) => {
    e.stopPropagation()
    toggleDropdown()
  }

  return (
    <Button
      variant={variant}
      height={height}
      leadingIcon={leadingIcon}
      label={label}
      classNames={`${classNames}  ${BUTTON_DROPDOWN_CLASSNAME}-${id}`}
      trailingIcon={
        trailingIcon || (
          <div
            className={`p-2 ${
              isOpen ? 'transform rotate-180' : ''
            } transition-transform duration-200 ease-in-out ml-1 -mr-2`}
          >
            {isOpen ? (
              <Image src={caretIcon || WhiteCaretIcon} alt="Add Icon" />
            ) : (
              <Image src={caretIcon || WhiteCaretIcon} alt="Add Icon" />
            )}
          </div>
        )
      }
      onClick={handleOnClick}
      disabled={disabled}
    />
  )
}

ButtonDropdown.CTA = CTA
ButtonDropdown.Options = Options

export default ButtonDropdown
