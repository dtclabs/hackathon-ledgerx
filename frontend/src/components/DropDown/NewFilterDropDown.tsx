import React, { useRef, useState } from 'react'
import { useOutsideClick } from '@/hooks/useOutsideClick'

interface IDropDownProps {
  children?: React.ReactNode
  triggerButton: React.ReactNode
  width?: string
  position?: 'top' | 'bottom'
  disabled?: boolean
}

const NewFilterDropDown: React.FC<IDropDownProps> = ({
  width,
  children,
  triggerButton,
  position = 'bottom',
  disabled = false
}) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => {
    setIsShowDropDown(false)
  })

  return (
    <div className={`${width} relative inline-block text-left`} ref={wrapperRef}>
      <button
        className={`${width} disabled:opacity-70 disabled:cursor-not-allowed`}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          setIsShowDropDown(!isShowDropDown)
        }}
      >
        {triggerButton}
      </button>
      {isShowDropDown && (
        <div
          className={`origin-top-right absolute mt-2 w-full shadow-lg rounded bg-white border-[#EAECF0] border focus:outline-none z-20 ${
            (position === 'bottom' && ' right-0 ') || (position === 'top' && 'right-0 bottom-14')
          }`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
          onClick={() => {
            setIsShowDropDown(!isShowDropDown)
          }}
          aria-hidden
        >
          <div
            className="py-1"
            role="none"
            onClick={(e) => {
              setIsShowDropDown(false)
              e.stopPropagation()
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default NewFilterDropDown
