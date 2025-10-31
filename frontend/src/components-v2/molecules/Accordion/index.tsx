import React, { ReactNode, useMemo, useRef, useState } from 'react'

interface IAccordion {
  expandElement?: ReactNode
  children?: ReactNode
  wrapperClassName?: string
  onExpandClick?: () => void
  onCollapseClick?: () => void
  fullWidth?: boolean
  disabled?: boolean
  isExpand: boolean
  setIsExpand: (isExpand: boolean) => void
}

const getElementHeight = (element: HTMLElement) => (element?.scrollHeight ? `h-[${element?.scrollHeight}px]` : '')

const Accordion: React.FC<IAccordion> = ({
  children,
  isExpand,
  setIsExpand,
  expandElement,
  fullWidth,
  disabled,
  onExpandClick,
  onCollapseClick,
  wrapperClassName
}) => {
  const expandRef = useRef(null)

  const handleClickExpand = () => {
    if (!disabled) {
      setIsExpand(!isExpand)
    }
    if (!disabled && !isExpand && onExpandClick) {
      onExpandClick()
    }
    if (!disabled && isExpand && onCollapseClick) {
      onCollapseClick()
    }
  }

  const expandElementStyle = useMemo(
    () =>
      isExpand
        ? {
            height: expandRef?.current?.scrollHeight
          }
        : {
            height: 0
          },
    [isExpand]
  )

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={() => {
          handleClickExpand()
        }}
        className={`${fullWidth && 'w-full'} text-left ${disabled && 'cursor-default'}`}
      >
        {children}
      </button>
      <div
        ref={expandRef}
        style={expandElementStyle}
        className={`overflow-hidden transition-height duration-300 ease-in-out h-[100%] ${fullWidth ? 'w-full' : ''}`}
      >
        {expandElement}
      </div>
    </div>
  )
}

export default Accordion
