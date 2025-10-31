import TextField from '@/components/TextField/TextField'
import Image from 'next/legacy/image'
import React, { useState } from 'react'
import SearchIcon from '@/public/svg/search-md.svg'
import Button from '../atoms/Button'

export type ITab = {
  name: string
  key: string
  imageUrl?: string
  rightImageUrl?: string
  count?: number
}

export type ITabsComponent = {
  tabs: ITab[]
  children?: any
  active?: string
  setActive?: (tab: string) => void
  activeStyle?: string
  unActiveStyle?: string
  classNameBtn?: string
  className?: string
  imageClassName?: string
  onClick?: () => void
  classNameCount?: string
  disabled?: boolean
  wrapperClassName?: string
  hasSearch?: boolean
  search?: string
  onChangeSearch?: (e) => void
  searchPlaceholder?: string
}

const TabsV3: React.FC<ITabsComponent> = ({
  imageClassName,
  tabs,
  children,
  wrapperClassName,
  active,
  setActive,
  activeStyle,
  classNameBtn,
  unActiveStyle,
  className,
  onClick,
  classNameCount,
  disabled,
  hasSearch,
  onChangeSearch,
  search,
  searchPlaceholder
}) => {
  const [isOpenSearch, setIsOpenSearch] = useState(false)
  const changeTab = (key: string) => {
    setActive(key)
    if (onClick) {
      onClick()
    }
  }
  return (
    <div className="flex flex-col w-full rounded-md h-full">
      <div className={`flex justify-between  ${wrapperClassName}`}>
        <div className={`flex w-full ${className}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`items-center justify-center border border-b-0 text-xs flex py-2 px-6 rounded-t-xl font-semibold min-w-[140px] ${
                active === tab.key
                  ? `text-white bg-black-0 border-black-0 ${activeStyle}`
                  : `border-[#E2E2E0] text-neutral-900 ${unActiveStyle}`
              }
               ${classNameBtn}`}
              type="button"
              onClick={() => changeTab(tab.key)}
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                {tab.imageUrl && <img className={imageClassName} alt="img" src={tab.imageUrl} />} {tab.name}
                {tab.count ? `(${tab.count})` : ''}{' '}
                {tab.rightImageUrl && <img className={imageClassName} alt="img" src={tab.rightImageUrl} />}
              </div>
            </button>
          ))}
        </div>
        {hasSearch && (
          <div className="flex items-center border border-grey-200 rounded-lg w-fit">
            <Button
              height={24}
              variant="transparent"
              classNames="border-0 px-2 py-2 h-[30px] w-[30px]"
              leadingIcon={<Image src={SearchIcon} alt="search" width={20} height={20} />}
              onClick={() => {
                setIsOpenSearch(!isOpenSearch)
              }}
            />
            <TextField
              classNameInput={`focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full h-[24px] transition-width duration-300 ease-in-out  ${
                isOpenSearch ? 'w-[200px] pr-2' : 'w-0'
              }`}
              errorClass="mt-1"
              name="tab-search"
              value={search}
              onChange={onChangeSearch}
              placeholder={searchPlaceholder || 'Search...'}
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {children.map((props) => (
          <div key={props.key} className={`w-full ${active === props.key ? 'inline-block' : 'hidden'}`}>
            {props.props.children}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TabsV3
