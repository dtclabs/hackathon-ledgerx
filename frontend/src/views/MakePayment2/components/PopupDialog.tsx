/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useRef, useEffect } from 'react'

const PopupDialog = ({ trigger, children, placement, width = '250px' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef(null)
  const triggerRef = useRef(null)

  const togglePopup = () => setIsOpen(!isOpen)

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target) && !triggerRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsOpen(false) // Close the popup on scroll
    }

    // Add scroll listener when the popup is open
    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true)
    }

    // Cleanup function to remove the event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [])

  const getPopupPosition = () => {
    if (!triggerRef.current) return {}
    const rect = triggerRef.current.getBoundingClientRect()
    const positions = {
      above: { bottom: window.innerHeight - rect.top + 5, left: rect.left, right: window.innerWidth - rect.right },
      below: { top: rect.bottom + 5, left: rect.left, right: window.innerWidth - rect.right },
      left: { top: rect.top, left: rect.left - 260, right: window.innerWidth - rect.right + 260 }, // Assuming popup width of 250px + margin
      right: { top: rect.top, left: rect.right + 10 }
    }
    return positions[placement] || positions.below // Default to 'below'
  }

  return (
    <>
      <span ref={triggerRef} onClick={togglePopup}>
        {trigger}
      </span>
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed z-50 border border-gray-300 p-4 bg-white shadow-lg rounded-md overflow-hidden"
          style={{ ...getPopupPosition(), width }}
        >
          {children}
        </div>
      )}
    </>
  )
}

export default PopupDialog
