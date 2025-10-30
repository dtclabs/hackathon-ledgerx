import React, { useCallback, useEffect, useRef } from 'react'
import { IModalProps } from './interface'

const Modal: React.FC<IModalProps> = ({
  showModal,
  setShowModal,
  children,
  onClose,
  isDisabledOuterClick = false,
  zIndex = 'z-[100000]',
  disableESCPress,
  onEscape
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null)

  const closeModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onClose) onClose()
    if (modalRef.current === e.target) {
      e.stopPropagation()
      // if (setShowModal) setShowModal(false)
    }
  }
  const keyPress = useCallback(
    (e) => {
      if (e.key === 'Escape' && showModal && !disableESCPress) {
        if (setShowModal) setShowModal(false)
        if (onClose) onClose()
        if (onEscape) onEscape()
      }
    },
    [setShowModal, showModal, onClose, onEscape, disableESCPress]
  )
  const handleClickModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    if (isDisabledOuterClick) return
    closeModal(e)
  }

  useEffect(() => {
    document.addEventListener('keydown', keyPress)
    return () => document.removeEventListener('keydown', keyPress)
  }, [keyPress])

  return (
    showModal && (
      <div
        className={`fixed w-full h-full max-h-full inset-0 flex items-center bg-gray-700 bg-opacity-70  overflow-x-hidden overflow-y-auto ${zIndex}`}
        ref={modalRef}
        onClick={(e: any) => handleClickModal(e)}
        aria-hidden
      >
        <div className="w-full max-h-full flex justify-center items-start">{children}</div>
      </div>
    )
  )
}

export default Modal
