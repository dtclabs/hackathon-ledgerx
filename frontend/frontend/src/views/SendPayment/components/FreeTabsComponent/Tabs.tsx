/* eslint-disable react/no-array-index-key */
import React from 'react'

export type ITab = {
  name: string
  key: string
  count?: number
}

export type ITabsComponent = {
  tabsWrapperClass?: string
  tabs: ITab[]
  children?: any
  active: string
  organization?: any
  endButton?: any
  noBorder?: boolean
  height?: string
  className?: string
  callback?: () => void
  setActive: (key: string) => void
}

const Tabs: React.FC<ITabsComponent> = ({
  active,
  tabs,
  organization,
  children,
  noBorder,
  className = '',
  endButton,
  tabsWrapperClass = '',
  callback,
  setActive
}) => {
  const changeTab = (key: string) => {
    setActive(key)
    if (callback) {
      callback()
    }
  }
  return (
    <div className="flex flex-col w-full">
      <div
        className={` flex justify-between items-center p-8 ${tabsWrapperClass} ${
          !noBorder ? 'border-b border-[#EBEDEF]' : ''
        } `}
      >
        <div className={`flex gap-6  ${className}`}>
          {tabs.map((tab) => (
            <div key={tab.key}>
              <button
                className={`font-inter flex gap-2 text-sm w-full h-full  px-4 py-2 rounded-lg hover:bg-gray-100 ${
                  active === tab.key ? 'bg-[#EAECF0] text-neutral-900 font-semibold ' : 'text-gray-1100 font-medium'
                }`}
                type="button"
                onClick={() => changeTab(tab.key)}
              >
                {tab.name} for {organization.data.name}
                {tab.count && tab.count !== 0 ? (
                  <div className="w-5 h-5 flex justify-center items-center text-[#F3F4F6] rounded-full bg-grey-900 text-sm leading-3 font-medium">
                    {tab.count}
                  </div>
                ) : (
                  ''
                )}
              </button>
            </div>
          ))}
        </div>
        {endButton}
      </div>
      <div className="flex-4 flex">
        {children.map((props) => (
          <div key={props.key} className={`w-full  ${active === props.key ? 'inline-block' : 'hidden'}`}>
            {props.props.children}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tabs
