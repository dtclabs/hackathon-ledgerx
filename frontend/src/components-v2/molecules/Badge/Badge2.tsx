/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import Typography from '@/components-v2/atoms/Typography'
import React from 'react'
import Image from 'next/legacy/image'

interface ChildProps {
  children: React.ReactNode
  variant?: 'rounded' | 'rounded-outline'
  color?: 'error' | 'success' | 'orange' | 'neutral'
  size?: 'small' | 'medium' | 'large'
  extendedClass?: string
}

interface BadgeWithChildren extends React.FC<ChildProps> {
  Label: React.FC<any>
  Icon: React.FC<any>
}

/* Component Level: Core Wrapper */
export const Badge: BadgeWithChildren = ({ children, variant, color, size, extendedClass }) => {
  const modifiedChildren = React.Children.map(children, (child: any) =>
    React.cloneElement(child, {
      variant,
      color
    })
  )

  const sizeMap = (): string => {
    switch (size) {
      case 'small':
        return 'text-xs px-2.5 py-1.5'
      case 'medium':
        return 'text-sm px-3 py-1.5'
      case 'large':
        return 'text-base px-4 py-2'
      default:
        return 'text-sm px-3 py-1.5'
    }
  }

  const variantMap = () => {
    let className = ''
    switch (variant) {
      case 'rounded':
        className += 'rounded-full '
        if (color === 'success') {
          className += 'rounded-full bg-[#E7F8ED] '
        } else if (color === 'error') {
          className += 'bg-error-50 text-error-500 '
        } else if (color === 'orange') {
          className += 'bg-warning-50 text-warning-500 '
        } else {
          className += 'bg-gray-200 text-gray-700 '
        }
        break
      case 'rounded-outline':
        className += 'rounded-full border '
        if (color === 'success') {
          className += 'rounded-full bg-[#E7F8ED] '
        } else if (color === 'error') {
          className += 'bg-white '
        } else {
          className += 'bg-gray-200 '
        }
        break
      default:
        className += 'rounded'
    }

    return className
  }

  return (
    <div className={`flex flex-row items-center justify-center gap-1 ${extendedClass} ${sizeMap()} ${variantMap()}`}>
      {modifiedChildren}
    </div>
  )
}

const BadgeLabel: React.FC<any> = ({ children, variant, color, noWrap }) => (
  <Typography variant="caption" color={color} classNames={noWrap && 'whitespace-nowrap'}>
    {children}
  </Typography>
)

const BadgeIcon = ({ icon, className }) => <Image className={className} src={icon} width={16} height={16} />

Badge.Icon = BadgeIcon
Badge.Label = BadgeLabel

export default Badge
