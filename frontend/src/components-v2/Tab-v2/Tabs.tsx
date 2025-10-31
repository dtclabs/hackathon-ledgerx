import React from 'react'

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
  rightButton?: React.ReactNode
}

const Tabs: React.FC<ITabsComponent> = ({
  imageClassName,
  tabs,
  children,
  wrapperClassName,
  active,
  setActive,
  activeStyle,
  rightButton,
  classNameBtn,
  unActiveStyle,
  className,
  onClick,
  classNameCount,
  disabled
}) => {
  const changeTab = (key: string) => {
    setActive(key)
    if (onClick) {
      onClick()
    }
  }
  return (
    <div className="flex flex-col w-full rounded-md">
      <div className={`flex justify-between ${wrapperClassName}`}>
        <div className={`relative z-[1] ${className}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab flex items-center ${active === tab.key ? activeStyle : unActiveStyle} ${classNameBtn}`}
              type="button"
              onClick={() => changeTab(tab.key)}
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                {tab.imageUrl && <img className={imageClassName} alt="img" src={tab.imageUrl} />} {tab.name}{' '}
                {tab.count ? `(${tab.count})` : ''}{' '}
                {tab.rightImageUrl && <img className={imageClassName} alt="img" src={tab.rightImageUrl} />}
              </div>
            </button>
          ))}
        </div>
        {rightButton}
      </div>

      <div className="flex-4 flex">
        {children.map((props) => (
          <div key={props.key} className={`w-full ${active === props.key ? 'inline-block' : 'hidden'}`}>
            {props.props.children}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tabs
