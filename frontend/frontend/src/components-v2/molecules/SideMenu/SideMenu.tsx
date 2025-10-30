/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef } from 'react'

type SideMenuProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  withOverlay?: boolean
  width?: string // Width of the menu (e.g., '64', '1/2', 'full', etc.)
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, children, withOverlay = true, width = '64' }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Using Tailwind CSS to set the width dynamically
  const menuWidthClass = `w-${width}`

  return (
    <div className={`${isOpen ? 'fixed' : 'hidden'} inset-0 z-50 overflow-hidden`}>
      {withOverlay && <div className="bg-black bg-opacity-50 fixed inset-0" onClick={onClose} />}
      <div
        ref={menuRef}
        className={`fixed bg-white min-h-screen ${menuWidthClass} p-4 top-0 right-0 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {children}
      </div>
    </div>
  )
}

export default SideMenu

// import { FC } from 'react'
// import Image from 'next/image'
// import Typography from '@/components-v2/atoms/Typography'

// interface ISideMenuComposition {
//   Header?: typeof Header
//   Content?: typeof Content
// }

// export interface ISideMenuProps {
//   isOpen: boolean
//   width?: number
//   children: any
// }

// const SideMenuPush: FC<ISideMenuProps> & ISideMenuComposition = ({ isOpen, width = 150, children }) => (
//   <div
//     id="menu"
//     className="h-screen duration-300 block "
//     style={{ position: 'fixed', right: 0, top: 0, overflow: 'hidden', width, marginRight: isOpen ? 0 : -width }}
//   >
//     <div style={{ overflowX: 'hidden' }}>{children}</div>
//   </div>
// )

// interface IHeaderComposition {
//   Title?: React.FC<ITitleProps>
//   CloseButton?: React.FC<ICloseButton>
// }

// export interface IPropsHeader {
//   isOpen: boolean
//   children: any
// }

// interface IPropsContent {
//   children: any
// }

// const Header: FC<IPropsHeader> & IHeaderComposition = ({ children }) => (
//   <div style={{ borderBottom: '1px solid #EAECF0' }} className="p-6 py-8 flex items-center justify-between">
//     {children}
//   </div>
// )

// const Content: FC<IPropsContent> = ({ children }) => <div>{children}</div>

// interface ITitleProps {
//   title?: string
//   children?: any
// }

// const Title = ({ title, children }: ITitleProps) => (
//   <p style={{ color: '#344054' }} className="text-base font-semibold leading-6 font-inter">
//     {title || children}
//   </p>
// )

// interface ICloseButton {
//   onClick?: any
// }

// const CloseButton = ({ onClick }: ICloseButton) => {
//   const handleClose = () => {
//     console.log('CLose')
//   }
//   return (
//     <button
//       type="button"
//       onClick={(e) => {
//         handleClose()
//       }}
//       className="bg-[#F3F5F7] flex justify-center items-center p-[14px] rounded-full "
//     >
//       <Image src="/image/Close.png" alt="Close" width={12} height={12} />
//     </button>
//   )
// }

// SideMenuPush.Header = Header
// SideMenuPush.Content = Content
// SideMenuPush.Header.Title = Title
// SideMenuPush.Header.CloseButton = CloseButton

// export default SideMenuPush
