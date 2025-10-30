import { useOutsideClick } from '@/hooks/useOutsideClick'
import Image from 'next/legacy/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../atoms/Button'

interface ISideModal {
  showModal: boolean
  setShowModal: (x: any) => void
  children: React.ReactNode
  title: any
  onClose?: () => void
  modalWidth?: string
  zIndex?: string
  disableESCPress?: boolean
  disableOutside?: boolean
  secondaryCTA?: { label?: string; onClick: any; disabled?: boolean }
  primaryCTA?: { label?: string; onClick: any; disabled?: boolean }
  position?: 'right' | 'left'
  nonOverLay?: boolean
  titleElement?: React.ReactNode
  renderActionButtons?: boolean
  titleClassName?: string
  data?: any
}

const SideModal: React.FC<ISideModal> = ({
  children,
  showModal,
  setShowModal,
  title,
  onClose,
  modalWidth = 'w-[500px]',
  zIndex = 'z-[1000]',
  disableESCPress,
  disableOutside,
  position = 'right',
  nonOverLay,
  secondaryCTA,
  primaryCTA,
  titleElement,
  renderActionButtons = true,
  titleClassName,
  data
}) => {
  const [hidden, setHidden] = useState(true)
  // Close
  const handleClose = () => {
    setShowModal(false)
    if (onClose) onClose()
  }

  // Press ESC
  const keyPress = useCallback(
    (e) => {
      if (e.key === 'Escape' && showModal && !disableESCPress) {
        setShowModal(false)
        if (onClose) onClose()
      }
    },
    [setShowModal, showModal, onClose, disableESCPress]
  )

  useEffect(() => {
    document.addEventListener('keydown', keyPress)
    return () => document.removeEventListener('keydown', keyPress)
  }, [keyPress])

  // Click outside
  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => {
    if (!disableOutside) {
      if (onClose) onClose()
      setShowModal(false)
    }
  })

  // Clear & apply
  const handleClickSecondary = () => {
    if (secondaryCTA?.onClick) secondaryCTA?.onClick()
  }
  const handleClickPrimary = () => {
    if (primaryCTA?.onClick) primaryCTA?.onClick(data)
  }
  // Animate
  useEffect(() => {
    if (!showModal)
      setTimeout(() => {
        setHidden(true)
      }, 280)
    else {
      setHidden(false)
    }
  }, [showModal])

  return !nonOverLay ? (
    <div
      className={`fixed h-full max-h-full inset-0 bg-gray-700 bg-opacity-70 overflow-x-hidden overflow-y-auto font-inter ${zIndex} ${
        !hidden ? ' w-full ' : ' w-0 '
      }`}
    >
      <div
        className={`bg-white ${
          position === 'right' ? 'right-0' : 'left-0'
        } shadow-sideModal h-screen transition-all absolute duration-300 bottom-0 ${
          !showModal ? ' w-0 ' : ` ${modalWidth} `
        }`}
        ref={wrapperRef}
      >
        <div className={`${titleClassName} px-6 pt-6 pb-4 border-b flex items-center justify-between`}>
          <div className="text-base font-semibold leading-6">{title}</div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
            className="bg-[#F3F5F7] flex justify-center items-center p-[14px] rounded-full "
          >
            <Image src="/image/Close.png" alt="Close" width={12} height={12} />
          </button>
        </div>

        {renderActionButtons ? (
          <>
            <div className="p-6 border-b overflow-y-auto h-[calc(100vh-170px)]">{children}</div>
            <div className="flex items-center gap-3 p-6">
              {secondaryCTA?.onClick && (
                <Button
                  variant="grey"
                  height={40}
                  onClick={handleClickSecondary}
                  disabled={secondaryCTA?.disabled}
                  label={secondaryCTA?.label || 'Clear All'}
                />
              )}
              {primaryCTA?.onClick && (
                <Button
                  variant="black"
                  type="submit"
                  height={40}
                  onClick={handleClickPrimary}
                  disabled={primaryCTA?.disabled}
                  label={primaryCTA?.label || 'Apply'}
                />
              )}
            </div>
          </>
        ) : (
          <div className="p-6  overflow-y-auto h-[calc(100vh-81px)] relative">{children}</div>
        )}
      </div>
    </div>
  ) : (
    <div
      className={`bg-white shadow-sideModal h-[calc(100vh-114px)] transition-all duration-300 bottom-0  ${
        !showModal ? ' w-0 hidden ' : ` ${modalWidth}`
      }`}
      ref={wrapperRef}
    >
      <div className={`px-6 pt-6 pb-4 border-b flex items-center justify-between ${titleClassName}`}>
        <div className="text-base font-semibold leading-6">{title}</div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="bg-[#F3F5F7] flex justify-center items-center p-[14px] rounded-full "
        >
          <Image src="/image/Close.png" alt="Close" width={12} height={12} />
        </button>
      </div>

      <div className="p-6 border-b overflow-y-auto h-[calc(100vh-194px)]">{children}</div>
    </div>
  )
}

export default SideModal
