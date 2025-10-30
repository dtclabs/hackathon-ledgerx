import React, { useState } from 'react'
import { SideNavBar, ISideBarProps } from '@/components-v2/organisms/Sidebar'
import TopAppBar, { IPropsTopBar } from '@/components-v2/molecules/Topbar'
import { LoaderLX } from '@/components-v2/LoaderLX'
import { useMobileMenu } from '@/contexts/MobileMenuContext'

interface ChildProps {
  children: React.ReactNode
  bannerDisplayed?: boolean
  isLoading?: boolean
}
interface ListViewWithChildren extends React.FC<ChildProps> {
  Header: React.FC<IPropsTopBar>
  Body: BodyWithChildren
}

interface BodyWithChildren extends React.FC<ChildProps> {
  Sidebar: React.FC<ISideBarProps>
  Content: React.FC<ChildProps>
}

/* Component Level: Core Wrapper */
const BaseTemplate: ListViewWithChildren = ({ children, isLoading }) => {
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu()

  return isLoading ? (
    <div className="h-screen flex justify-center">
      <LoaderLX />
    </div>
  ) : (
    <div className="bg-grey-100 h-screen overflow-hidden relative">
      {children}
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={toggleMobileMenu}
          onKeyDown={(e) => e.key === 'Escape' && toggleMobileMenu()}
          role="button"
          tabIndex={0}
          aria-label="Close mobile menu"
        />
      )}
    </div>
  )
}

/* Component Level: Inner Core Wrapper - To Handle Sidebar / Content Position */
export const Body: BodyWithChildren = ({ children, bannerDisplayed }) => (
  // Calculate the header into giving the height for content
  <div className="flex flex-row h-full pb-4 relative">{children}</div>
)

/* Component Level: White Card Content */
export const Content: React.FC<ChildProps> = ({ children, bannerDisplayed = false }) => (
  <div
    className={`w-full min-w-0 lg:min-w-[1024px] sm:min-w-[0px] mt-2 lg:mt-4 ml-2 lg:ml-4 mr-2 lg:mr-4 ${
      bannerDisplayed ? 'h-[calc(100vh-84px)]' : 'h-[calc(100vh-84px)]'
    } rounded-xl font-inter flex flex-col`}
  >
    {children}
  </div>
)

BaseTemplate.Body = Body
BaseTemplate.Header = TopAppBar

Body.Sidebar = SideNavBar
Body.Content = Content

export default BaseTemplate
