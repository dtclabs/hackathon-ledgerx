import React, { useRef, useState } from 'react'
import { useOutsideClick } from '@/hooks/useOutsideClick'

interface IDropDownFilterTransactionProps {
  children?: React.ReactNode
  triggerButton: React.ReactNode
  width?: string
  maxHeight?: string
  isShowDropDown: boolean
  setIsShowDropDown: (isShowDropDown: boolean) => void
  className?: string
  position?: 'top' | 'bottom' | 'right'
  placement?: EPlacementFilterTransaction
  outsideClick?: () => void
}

export enum EPlacementFilterTransaction {
  BOTTOMRIGHT = 'bottom-left',
  TOPRIGHT = 'top-left'
}

const DropDownFilterTransaction: React.FC<IDropDownFilterTransactionProps> = ({
  children,
  triggerButton,
  isShowDropDown,
  setIsShowDropDown,
  width,
  maxHeight,
  className,
  position = 'bottom',
  placement,
  outsideClick
}) => {
  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => {
    setIsShowDropDown(false)
    if (outsideClick) outsideClick()
  })

  return (
    <div className={`relative inline-block text-left  ${width && width}`} ref={wrapperRef}>
      <div>{triggerButton}</div>
      {isShowDropDown && (
        <div
          className={`origin-top-right ${className} ${
            maxHeight || 'max-h-[200px]'
          }  overflow-auto scrollbar absolute z-20  ${
            position === 'right'
              ? placement === EPlacementFilterTransaction.TOPRIGHT && 'top-[0px] left-[50px] laptop:top-[-100px]'
              : position === 'bottom'
              ? placement === EPlacementFilterTransaction.BOTTOMRIGHT
                ? 'left-0 mt-2'
                : 'right-0 mt-2'
              : placement === EPlacementFilterTransaction.TOPRIGHT
              ? 'bottom-[72px] left-0'
              : 'bottom-[72px] right-0'
          } rounded-md shadow-lg bg-white border border-[#EAECF0] ring-opacity-10 focus:outline-none`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="p-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default DropDownFilterTransaction
