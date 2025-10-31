import React, { useRef, useState, useEffect } from 'react'
import CopyToClipboardBtn from '@/utils/copyTextToClipboard'

interface ITooltip {
  shortText: string | any
  text: string | any
  enableCopy?: boolean
  className?: string
  position?: ETooltipPosition
  arrow?: boolean
  delayHide?: number
  whitespace?: string
}

export enum ETooltipPosition {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  BOTTOMLOW = 'BOTTOMLOW',
  RIGHT = 'RIGHT'
}

const Tooltip: React.FC<ITooltip> = ({
  shortText,
  text,
  enableCopy = false,
  className,
  arrow = true,
  whitespace,
  position = ETooltipPosition.TOP,
  delayHide
}) => {
  const [show, setShow] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const [tooltipHide, setTooltipHide] = useState(true)
  const tooltipHideDelayTimerRef = useRef(null)

  useEffect(() => {
    if (tooltipHide) {
      if (delayHide > 0) {
        tooltipHideDelayTimerRef.current = setTimeout(() => {
          setShow(false)
          setTooltipHide(false)
        }, delayHide)
      } else {
        setShow(false)
        setTooltipHide(false)
      }
    }
    return () => {
      clearTimeout(tooltipHideDelayTimerRef.current)
    }
  }, [delayHide, tooltipHide])

  return (
    (position === ETooltipPosition.TOP && (
      <div className="flex items-center gap-2 max-w-max">
        <div
          className="relative group max-w-max"
          onMouseEnter={() => {
            setShow(true)
            setIsHover(true)
          }}
          onMouseLeave={() => {
            setIsHover(false)
            setTooltipHide(true)
          }}
        >
          {shortText}
          {text && (
            <div
              className={`absolute z-10 w-full bottom-0 flex-col items-center ${
                !show && !isHover ? 'hidden' : 'flex'
              } ${!whitespace ? 'whitespace-nowrap' : `${whitespace}`}  ${className || 'mb-6'}`}
            >
              <span className="z-10 p-2 text-xs border border-gray-200 leading-none whitespace-no-wrap font-medium text-gray-900 bg-white shadow-tooltip rounded-lg">
                {text}
              </span>
              {arrow && <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-200" />}
            </div>
          )}
        </div>
        {enableCopy && <CopyToClipboardBtn textToCopy={text} />}
      </div>
    )) ||
    (position === ETooltipPosition.BOTTOM && (
      <div className="flex items-center gap-2 max-w-max">
        <div className="relative group max-w-max">
          {shortText}
          <div
            className={`absolute z-10 w-full flex-col items-center hidden group-hover:flex ${
              !whitespace ? 'whitespace-nowrap' : `${whitespace}`
            } text-xs font-medium text-gray-900 shadow-lg -mb-[105px] ${className}`}
          >
            <span className="rounded-lg p-2 bg-white border border-gray-200">{text}</span>
          </div>
        </div>
        {enableCopy && <CopyToClipboardBtn textToCopy={text} />}
      </div>
    )) ||
    (position === ETooltipPosition.BOTTOMLOW && (
      <div className="flex items-center gap-2 max-w-max mt-1">
        <div className="relative group max-w-max ">
          {shortText}
          <div
            className={`absolute z-10 w-full bottom-[-30px] left-[-170px] flex-col items-center hidden group-hover:flex whitespace-nowrap text-xs leading-none font-medium text-gray-900 shadow-lg -mb-[105px] ${className}`}
          >
            <span>{text}</span>
          </div>
        </div>
        {enableCopy && <CopyToClipboardBtn textToCopy={text} />}
      </div>
    )) ||
    (position === ETooltipPosition.RIGHT && (
      <div className="relative group flex items-center gap-2 max-w-max mt-1">
        <div className="max-w-max">
          {shortText}
          <div
            className={`w-full flex-col items-center hidden group-hover:flex whitespace-nowrap text-xs leading-none font-medium text-gray-900 shadow-lg -mb-[105px] ${className}`}
          >
            <span className="absolute right-0">{text}</span>
          </div>
        </div>
        {enableCopy && <CopyToClipboardBtn textToCopy={text} />}
      </div>
    ))
  )
}

export default Tooltip
