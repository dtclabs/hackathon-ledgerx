// AlertBanner.tsx
import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import React, { ReactNode } from 'react'
import RedErrorIcon from '@/public/svg/icons/warning-round-red.svg'
import YellowWarningIcon from '@/public/svg/icons/warning-icon-triangle-yellow.svg'
import InfoIcon from '@/public/svg/icons/info-circle.svg'
import Button from '@/components-v2/atoms/Button'

type AlertBannerProps = {
  isVisible: boolean
  removeBg?: boolean
  classNames?: string
  onClickClose?: () => void
  variant: 'error' | 'success' | 'warning' | 'info'
  fullWidth?: boolean
  children: ReactNode
}

type AlertBannerIconProps = {
  icon?: any
}

type IBannerTextProps = {
  children: ReactNode
  extendedClass?: string
  variant?: 'error' | 'success' | 'warning' | 'info'
}

type IBannerCloseButtonProps = {
  label?: string
  onClickClose: () => void
}

const ICON_VARIANT_MAP: any = {
  error: RedErrorIcon,
  success: YellowWarningIcon,
  warning: YellowWarningIcon,
  info: InfoIcon
}

const AlertBanner: React.FC<AlertBannerProps> & {
  Icon: React.FC<AlertBannerIconProps>
  Text: React.FC<IBannerTextProps>
  CloseButton: React.FC<IBannerCloseButtonProps>
} = ({ variant, children, isVisible, onClickClose, removeBg, fullWidth }) => {
  if (!isVisible) return null

  const backgroundColor = {
    error: 'bg-[#F9E8E8] border border-[#C61616]',
    success: 'bg-green-500',
    warning: 'bg-[#FDF1E7] border border-[#E9740B]',
    info: 'bg-[#E5F6FF] border border-[#99DAFF]'
  }[variant]

  const childrenWithProps = React.Children.map(children, (child) => {
    // Check if the child is a valid React element
    if (React.isValidElement(child)) {
      // Inject the 'variant' prop into the child
      // @ts-ignore
      return React.cloneElement(child, { variant })
    }
    return child
  })

  return (
    <div className={`flex items-center py-2 px-4 rounded ${removeBg ? '' : backgroundColor} ${fullWidth && 'w-full'}`}>
      {childrenWithProps}
    </div>
  )
}

// @ts-ignore
const Icon: React.FC<AlertBannerIconProps> = ({ icon, variant }) => (
  <div className="flex items-center">
    <Image src={variant ? ICON_VARIANT_MAP[variant] : icon} alt="icon" height={15} width={15} />
  </div>
)

const Text: React.FC<IBannerTextProps> = ({ children, extendedClass, variant }) => (
  <div className="pl-2 w-full pr-2">
    <Typography color={variant} classNames={extendedClass}>
      {children}
    </Typography>
  </div>
)

// TODO - Need UI for this
const CloseButton: React.FC<IBannerCloseButtonProps> = ({ label, onClickClose }) => (
  <Button
    height={32}
    variant="whiteWithBlackBorder"
    classNames="whitespace-nowrap"
    onClick={onClickClose}
    label={label || 'Close'}
  />
)

AlertBanner.Icon = Icon
AlertBanner.Text = Text
AlertBanner.CloseButton = CloseButton

export default AlertBanner
