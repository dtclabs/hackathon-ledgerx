import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import Typography from '@/components-v2/atoms/Typography'

interface INotFoundProps {
  title: string
  subTitle?: string
  icon: any
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  label?: string
  widthIcon?: number
  heightIcon?: number
  extendWrapperClassName?: string
  height?: number
  width?: number
  disabled?: boolean
  imgBgLess?: boolean
}

const NotFound: React.FC<INotFoundProps> = ({
  icon,
  title,
  subTitle,
  onClick,
  className,
  label,
  heightIcon,
  widthIcon,
  extendWrapperClassName,
  disabled,
  imgBgLess
}) => (
  <div className={`flex items-center flex-col font-inter font-semibold ${extendWrapperClassName || ''}`}>
    {!imgBgLess ? (
      <div className="p-6 w-20 h-20 rounded-[100px] bg-remove-icon mt-16 mb-6 flex items-center justify-center">
        <Image src={icon} alt="document" width={widthIcon} height={heightIcon} />
      </div>
    ) : (
      <div className="mt-16 mb-6">
        <Image src={icon} alt="document" width={widthIcon} height={heightIcon} />
      </div>
    )}
    <div className="mb-8">
      <Typography classNames="text-center" variant="heading3" color="dark">
        {title}
      </Typography>
      {subTitle && (
        <Typography classNames="text-center" variant="body2" color="secondary">
          {subTitle}
        </Typography>
      )}
    </div>
    {label && (
      <div
        data-tip={`not_found_${title}_${subTitle}_${label}`}
        data-for={`not_found_${title}_${subTitle}_${label}`}
        data-tip-disable={!disabled}
      >
        <button
          type="button"
          disabled={disabled}
          className={`${
            disabled
              ? 'bg-neutral-300 cursor-not-allowed text-white text-sm rounded-lg py-[14px] px-8'
              : className || 'bg-dashboard-background text-sm rounded-lg py-[14px] px-8'
          }`}
          onClick={onClick}
        >
          {label}
        </button>
      </div>
    )}
    {disabled && (
      <ReactTooltip
        id={`not_found_${title}_${subTitle}_${label}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="right"
        className="!opacity-100 !rounded-lg"
      >
        <Typography classNames="max-w-[250px]" variant="caption" color="secondary">
          We are syncing transactions data. You will be able to add a source of funds after the sync is completed.
        </Typography>
      </ReactTooltip>
    )}
  </div>
)

export default NotFound
