import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'

interface ITab {
  name: string
  key: string
  imageUrl?: string
  rightImageUrl?: string
  count?: number
  disabled?: boolean
  disabledTooltip?: string
  hidden?: boolean
}

interface ITabsComponent {
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

const UnderlineTabs: React.FC<ITabsComponent> = ({
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
  const refs = useRef([])
  const tabrefs = useRef(null)
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [widths, setWidths] = useState([])
  const [totalWidth, setTotalWidth] = useState(0)

  const changeTab = (key: string) => {
    setActive(key)
    if (onClick) {
      onClick()
    }
  }

  const activeIndex = useMemo(() => tabs.length && tabs.findIndex((item) => item.key === active), [active, tabs])

  useEffect(() => {
    const newDivWidths = refs.current.map((item, index) => {
      if (index === 0) {
        return 0
      }
      return (refs.current[index - 1].offsetWidth * 100) / tabrefs.current.offsetWidth
    })

    setTotalWidth(tabrefs.current.offsetWidth)
    setWidths(newDivWidths)
  }, [tabs, screenWidth, active])

  const handleResize = () => {
    setScreenWidth(window.innerWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="flex flex-col w-full rounded-md">
      <div ref={tabrefs} className={`flex justify-between relative w-full ${wrapperClassName}`}>
        <div className={`flex w-full ${className}`}>
          {tabs.length &&
            tabs
              .filter((tab) => !tab?.hidden)
              .map((tab, index) => (
                <button
                  key={tab.key}
                  ref={(ref) => {
                    refs.current[index] = ref
                  }}
                  className={`h-full flex w-max items-center justify-center ${
                    active === tab.key
                      ? ` text-neutral-900 font-semibol  ${activeStyle}`
                      : ` text-[#b5b5b3] font-normal ${unActiveStyle}`
                  } text-xs h-[44px] px-3 min-w-fit ${classNameBtn} `}
                  type="button"
                  onClick={() => changeTab(tab.key)}
                  disabled={disabled || tab.disabled}
                >
                  <div
                    className={`flex items-center gap-2 ${tab.disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                    data-for={tab.disabled ? 'tabName' : ''}
                    data-tip={tab.disabled ? 'tabName' : ''}
                  >
                    {tab.imageUrl && <img className={imageClassName} alt="img" src={tab.imageUrl} />}
                    {tab.name}
                    {tab.rightImageUrl && <img className={imageClassName} alt="img" src={tab.rightImageUrl} />}
                  </div>
                  {tab.disabled && (
                    <ReactTooltip
                      id="tabName"
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      className="!opacity-100 !rounded-lg"
                    >
                      {tab.disabledTooltip}
                    </ReactTooltip>
                  )}
                  {tab.count && tab.count !== 0 ? (
                    <div
                      className={`${
                        classNameCount ||
                        `px-2 h-6 flex justify-center items-center text-[#0079DA]
                        rounded-full bg-[#E7F7FE] text-xs ml-3`
                      }`}
                    >
                      {tab.count}
                    </div>
                  ) : (
                    ''
                  )}
                </button>
              ))}
        </div>
        {widths.length && (
          <div
            className="underline-tabs"
            style={{
              transform: `translateX(${widths.reduce(
                (acc, cur, index) => (index <= activeIndex ? acc + cur : acc + 0),
                0
              )}%) scaleX(${refs.current[activeIndex].offsetWidth / totalWidth})`
            }}
          />
        )}
        {rightButton}
      </div>

      <div className="flex-4 flex">
        {children.map((props) => (
          <div key={props.key} className={`w-full ${active === props.key ? 'inline-block' : 'hidden'}`}>
            {props?.props?.children}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UnderlineTabs
