/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, useState, useRef, useEffect, createContext, useContext, ReactNode } from 'react'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import ChevronIcon from '@/public/svg/icons/chevron-dark.svg'
import Typography from '@/components-v2/atoms/Typography'
import ReactTooltip from 'react-tooltip'
import { useOutsideClick } from '@/hooks/useOutsideClick'

interface ISideMenuCollapsibleContext {
  id: string
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeIndex: number
  setActiveIndex: (index: number) => void
  setActivePage: (index: string) => void
  dropdownRef: React.RefObject<HTMLDivElement>
  buttonRef: React.RefObject<HTMLButtonElement>
  buttonHeight: number
  currentPage: string
  organizationId: string
  isSidebarOpen: boolean
}

const DropdownContext = createContext<ISideMenuCollapsibleContext | null>(null)

interface ISideMenuCollapsible {
  id: string
  children: ReactNode
  currentPage?: string
  organizationId: string
  childPaths: string[]
  isSidebarOpen: boolean
}

interface ISideMenuCollapsibleCTAProps {
  displayCaret?: boolean
  text: string
  icon?: any
}

interface ISideMenuCollapsibleMenuProps {
  children: ReactNode
}

interface ISideMenuCollapsibleMenuItemProps {
  children: ReactNode
  index: number
  onClick?: () => void
  path: string
  active?: boolean
}

// TODO - Could Propably refactor this to use useReducer
// TODO - Could maybe use as dropdown if we don't have one in future

const DropdownAccordion: FC<ISideMenuCollapsible> & {
  CTA: FC<ISideMenuCollapsibleCTAProps>
  Menu: FC<ISideMenuCollapsibleMenuProps>
  Item: FC<ISideMenuCollapsibleMenuItemProps>
} = ({ children, currentPage, organizationId, childPaths, isSidebarOpen, id }) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef(null)

  const [activeIndex, setActiveIndex] = useState(-1)
  const [buttonHeight, setButtonHeight] = useState(0)
  const [isOpen, setIsOpen] = useState(childPaths.some((pathItem) => currentPage.startsWith(pathItem)))
  const [activePage, setActivePage] = useState(currentPage)

  useOutsideClick(wrapperRef, () => {
    if (!isSidebarOpen) setIsOpen(false)
  })

  useEffect(() => {
    if (buttonRef.current) {
      setButtonHeight(buttonRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    if (!isSidebarOpen) {
      setIsOpen(false)
    }
    // else if (isSidebarOpen && childPaths.some((pathItem) => currentPage.startsWith(pathItem))) {
    //   setIsOpen(true)
    // }
  }, [isSidebarOpen])

  useEffect(() => {
    setActivePage(currentPage)
    if (!childPaths.some((pathItem) => currentPage.startsWith(pathItem))) {
      setIsOpen(false)
      setActiveIndex(-1)

      const line = dropdownRef.current && (dropdownRef.current.querySelector('.line-indicator') as HTMLElement)
      if (line) line.style.height = '0px'
    }
  }, [currentPage])

  const contextValue = {
    id,
    isOpen,
    setIsOpen,
    activeIndex,
    setActiveIndex,
    dropdownRef,
    buttonHeight,
    buttonRef,
    currentPage: activePage,
    organizationId,
    setActivePage,
    isSidebarOpen
  }

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={wrapperRef}
        className="relative"
        data-tip={`side-menu-collapsible-${id}`}
        data-for={`side-menu-collapsible-${id}`}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

DropdownAccordion.CTA = ({ text, displayCaret = true, icon }) => {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('DropdownAccordion.CTA must be used within DropdownAccordion')
  }

  return (
    <button
      ref={context?.buttonRef}
      type="button"
      onClick={() => context?.setIsOpen((prev) => !prev)}
      className={`${
        context?.isSidebarOpen ? 'w-full pl-3' : `w-[50px] pl-4 ${context?.isOpen && 'bg-grey-200'}`
      } text-left h-10 flex items-center justify-between pr-2 py-2 rounded-md hover:bg-grey-200 `}
    >
      <div className="flex flex-row items-center gap-2">
        {/* <Image src={icon} alt="icon" height={10} width={10} /> */}
        <SVGIcon name={icon} width={16} height={16} stroke={context?.activeIndex > -1 ? '#2D2D2C' : '#777675'} />
        {context?.isSidebarOpen && (
          <Typography variant="body2" color="secondary">
            {text}
          </Typography>
        )}
      </div>

      {displayCaret && (
        <span
          className={`inline-block transform transition-transform ${
            context?.isOpen ? 'rotate-0' : 'rotate-180'
          } origin-center `}
        >
          <Image src={ChevronIcon} height={16} width={16} alt="caret-icon" />
        </span>
      )}
    </button>
  )
}

// Menu Component
DropdownAccordion.Menu = ({ children }) => {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('DropdownAccordion.Menu must be used within DropdownAccordion')
  }
  const { isOpen, dropdownRef, buttonHeight, setActivePage, currentPage, id } = context

  useEffect(() => {
    setActivePage(currentPage)
  }, [currentPage])

  return context.isSidebarOpen ? (
    <div
      ref={dropdownRef}
      style={{ maxHeight: isOpen ? `${dropdownRef.current?.scrollHeight}px` : '0' }}
      className="overflow-hidden transition-[max-height] duration-300 ease-in-out ml-3"
    >
      <ul>{children}</ul>
      {isOpen && (
        <div
          style={{ top: buttonHeight, height: dropdownRef.current?.scrollHeight, width: 1 }}
          className="absolute left-3 bg-[#E2E2E0]"
        />
      )}
    </div>
  ) : (
    <div
      className={`fixed left-[72px] mt-[-36px] bg-white rounded-md border border-[#E2E2E0] z-[49] min-w-[130px] ${
        !isOpen && 'hidden'
      }`}
      style={{
        boxShadow: '0px 4px 12px 4px rgba(16, 24, 40, 0.02), 0px 4px 12px 0px rgba(16, 24, 40, 0.02)'
      }}
    >
      <ul>{children}</ul>
    </div>
  )
}

DropdownAccordion.Item = ({ children, index, onClick, path, active = true }) => {
  const context = useContext(DropdownContext)
  const itemRef = useRef<HTMLLIElement>(null)
  const router = useRouter()

  if (!context) {
    throw new Error('DropdownAccordion.Item must be used within DropdownAccordion')
  }
  const { activeIndex, setActiveIndex, dropdownRef, buttonHeight, currentPage, setIsOpen, isSidebarOpen } = context

  useEffect(() => {
    if (currentPage.startsWith(`/[organizationId]${path}`)) {
      setIsOpen(true)
      setActiveIndex(index)
    }
  }, [currentPage])

  useEffect(() => {
    if (activeIndex === index && itemRef.current && dropdownRef.current && isSidebarOpen) {
      const line = dropdownRef.current.querySelector('.line-indicator') as HTMLElement
      if (line) {
        // Calculate position relative to the dropdown menu
        const relativeTopPosition = itemRef.current.offsetTop - dropdownRef.current.offsetTop
        line.style.transform = `translateY(${relativeTopPosition}px)`
        line.style.height = `${itemRef.current.offsetHeight}px`
        line.style.top = '0px'
      }
    }
  }, [activeIndex, index, buttonHeight, isSidebarOpen])

  const handleOnClick = () => {
    if (onClick) onClick()
    if (active) {
      setActiveIndex(index)
      router.push(`/${context.organizationId}${path}`)
    }
  }

  return (
    <li ref={itemRef} className="relative cursor-pointer h-10 rounded-md mb-0.5" onClick={handleOnClick}>
      <div
        className={`${isSidebarOpen && 'ml-4'} ${activeIndex === index && 'bg-grey-200'} rounded-md p-3 ${
          !active ? ' opacity-40 hover:bg-grey-200' : 'hover:bg-grey-200'
        }`}
      >
        <Typography
          data-tip={`${path}-${index}`}
          data-for={`${path}-${index}`}
          variant="body2"
          color={activeIndex === index ? 'black' : 'secondary'}
        >
          {children}
        </Typography>
      </div>

      {index === 0 && isSidebarOpen && (
        <div
          style={{ zIndex: 9, backgroundColor: '#2D2D2C', width: 1 }}
          className="absolute left-0 transition-transform duration-300 ease-in-out line-indicator "
        />
      )}
      {!active && (
        <ReactTooltip
          id={`${path}-${index}`}
          place="right"
          arrowColor="transparent"
          backgroundColor="#EAECF0"
          textColor="#101828"
          effect="solid"
          className="!opacity-100 !rounded-lg max-w-[200px] text-xs"
        >
          Please buy Starter or above plan to access this feature
        </ReactTooltip>
      )}
    </li>
  )
}

export default DropdownAccordion
