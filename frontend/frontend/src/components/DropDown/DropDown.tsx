import React, { useRef } from 'react'
import { useOutsideClick } from '@/hooks/useOutsideClick'

interface IDropDownProps {
  children?: React.ReactNode
  triggerButton: React.ReactNode
  width?: string
  maxHeight?: string
  isShowDropDown: boolean
  setIsShowDropDown: (isShowDropDown: boolean) => void
  className?: string
  position?: 'top' | 'bottom' | 'right' | 'left'
  placement?: EPlacement
  outsideClick?: () => void
  widthBtn?: string
  bottomPosition?: string
  space?: string
  zIndex?: number
  isOutsideClickDisabled?: boolean
  removeElementOnClose?: boolean
}

export enum EPlacement {
  BOTTOMRIGHT = 'bottom-left',
  TOPRIGHT = 'bottom-left',
  TOPLEFT = 'top-left',
  BESIDE = 'beside'
}

const DropDown: React.FC<IDropDownProps> = ({
  children,
  triggerButton,
  isShowDropDown,
  setIsShowDropDown,
  width,
  maxHeight,
  className,
  position = 'bottom',
  placement,
  outsideClick,
  widthBtn,
  bottomPosition,
  space = 'p-1',
  zIndex = 20,
  isOutsideClickDisabled,
  removeElementOnClose = true
}) => {
  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => {
    if (!isOutsideClickDisabled) {
      setIsShowDropDown(false)
      if (outsideClick) outsideClick()
    }
  })

  return (
    <div className={`relative inline-block text-left ${width && width} ${widthBtn}`} ref={wrapperRef}>
      <div>{triggerButton}</div>
      {(isShowDropDown || !removeElementOnClose) && (
        <div
          style={{ zIndex }}
          className={`origin-top-right ${!isShowDropDown && 'hidden'} ${className} ${
            maxHeight || 'max-h-[200px]'
          }  overflow-auto min-w-full scrollbar absolute ${
            position === 'left'
              ? placement === EPlacement.BESIDE && 'top-0 right-[50px] xl:top-[-20px]'
              : position === 'bottom'
              ? placement === EPlacement.BOTTOMRIGHT
                ? 'left-0 mt-2'
                : 'right-0 mt-2'
              : placement === EPlacement.TOPRIGHT
              ? `${bottomPosition || 'bottom-[72px]'} left-0`
              : placement === EPlacement.TOPLEFT
              ? `${bottomPosition || 'bottom-[72px]'} `
              : `${bottomPosition || 'bottom-[72px]'} right-0`
          } rounded-md shadow-lg bg-white border border-[#EAECF0] ring-opacity-10 focus:outline-none ${width && width}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className={space} role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default DropDown
