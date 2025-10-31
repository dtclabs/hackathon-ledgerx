import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import useIsMobile from '@/hooks/useIsMobile'

interface MobileMenuContextType {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext)
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider')
  }
  return context
}

interface MobileMenuProviderProps {
  children: ReactNode
}

export const MobileMenuProvider: React.FC<MobileMenuProviderProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile, isMobileMenuOpen])

  const value = useMemo(
    () => ({
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu
    }),
    [isMobileMenuOpen]
  )

  return <MobileMenuContext.Provider value={value}>{children}</MobileMenuContext.Provider>
}
