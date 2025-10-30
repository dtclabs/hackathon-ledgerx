import React, { FC } from 'react'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import Arrow from '@/public/svg/icons/arrow-narrow-right.svg'
import Typography from '@/components-v2/atoms/Typography'

interface IPropsDashboardQuickAction {
  id: string
  onClick?: (id: string) => null
  disabled?: boolean
  tooltipMessage?: string
  icon?: any
  title: string
  subTitle: string
  width?: number
}

export const DashboardQuickActionCard: FC<IPropsDashboardQuickAction> = ({
  id,
  onClick,
  disabled,
  icon,
  tooltipMessage,
  title,
  subTitle,
  width
}) => {
  const dynamicClass = disabled
    ? 'bg-dashboard-border-200 border-dashboard-border-200 cursor-not-allowed'
    : 'hover:border-grey-901 hover:bg-gray-100 bg-white  border-white'

  return (
    <div
      className="min-w-[270px]"
      data-tip={`quick-action-${id}`}
      data-for={`quick-action-${id}`}
      data-tip-disable={!disabled}
    >
      <button
        className={`group p-4 flex items-start gap-3 rounded-xl border-[1px] ${
          width ? `w-[${width}px]` : 'w-full'
        } ${dynamicClass}`}
        type="button"
        onClick={onClick(id)}
        disabled={disabled}
      >
        <div className="flex items-center">
          <Image src={icon} alt="" width={44} height={44} />
          {disabled && tooltipMessage && (
            <ReactTooltip
              id={`quick-action-${id}`}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              className="!opacity-100 !rounded-lg"
            >
              <div className="max-w-[250px] text-xs font-inter font-medium text-grey-800">{tooltipMessage}</div>
            </ReactTooltip>
          )}
        </div>
        <div className={`${disabled ? 'text-grey-400' : ''} flex flex-col w-full`}>
          <div className="flex flex-row justify-between text-left">
            <Typography variant="body1" styleVariant="semibold" color="primary">
              {title}
            </Typography>
            <Image src={Arrow} alt="arrow" />
          </div>
          <div className="text-xs leading-4 text-left font-normal">{subTitle}</div>
        </div>
      </button>
    </div>
  )
}

export default DashboardQuickActionCard
