import React from 'react'

export type ITab = {
  name: string
  key: string
  imageUrl?: string
  rightImageUrl?: string
  count?: number
  disabled?: boolean
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
        <div className={`flex w-full ${className}`}>
          {tabs.map(
            (tab) =>
              !tab?.disabled && (
                <button
                  key={tab.key}
                  className={`h-full flex items-center ${
                    active === tab.key ? activeStyle : unActiveStyle
                  } ${classNameBtn}`}
                  type="button"
                  onClick={() => changeTab(tab.key)}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2">
                    {tab.imageUrl && <img className={imageClassName} alt="img" src={tab.imageUrl} />} {tab.name}{' '}
                    {tab.rightImageUrl && <img className={imageClassName} alt="img" src={tab.rightImageUrl} />}
                  </div>
                  {tab.count && tab.count !== 0 ? (
                    <div
                      className={`${
                        classNameCount ||
                        `w-6 h-6 flex justify-center items-center ${
                          active === tab.key ? 'text-grey-800' : 'text-grey-700'
                        } rounded-[2px] bg-blanca-300 text-sm font-medium ml-2`
                      }`}
                    >
                      {tab.count}
                    </div>
                  ) : (
                    ''
                  )}
                </button>
              )
          )}
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
