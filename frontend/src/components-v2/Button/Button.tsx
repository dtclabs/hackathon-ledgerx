/* eslint-disable react/button-has-type */
import React from 'react'
import Image from 'next/legacy/image'
import Loader from '@/components/Loader/Loader'

type IVariants = 'contained' | 'outlined' | 'outlined-borderless'
type IColors = 'primary' | 'secondary' | 'danger' | 'tertiary' | 'success' | 'white' | 'gray'
type ISize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: any
  color?: IColors
  type?: 'button' | 'submit'
  size?: ISize
  className?: string
  fullWidth?: boolean
  pill?: boolean
  leftIcon?: any
  children?: any
  rightIcon?: any
  loader?: boolean
}

const classes = {
  base: 'focus:outline-none transition ease-in-out duration-300 rounded-[4px] font-weight-600 inline-flex items-center justify-center',
  // disabled: 'disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed',
  pill: 'rounded-full',
  size: {
    xs: 'px-[8px] py-[3px] h-[24px] text-[12px]',
    sm: 'px-[12px] py-[7px] h-[32px] text-[12px] font-medium',
    md: 'px-4 py-[10px] rounded-[4px] font-medium leading-5 text-sm font-inter',
    lg: 'px-[20px] py-[12px] h-[48px] text-[16px]',
    xl: 'px-[24px] py-[16px] h-[56px] text-[16px]',
    xxl: 'h-[65px] text-[16px]'
  }
}

const IMAGE_MAP_SIZE = {
  xs: 14,
  sm: 17,
  md: 20,
  xxl: 4
}

const renderButtonVariant = (variant: IVariants, color: IColors) => {
  let buttonStyle = ''
  if (variant === 'contained') {
    switch (color) {
      case 'primary':
        buttonStyle =
          'bg-neutral-900 text-white hover:bg-neutral-800 focus:bg-neutral-300 focus:shadow-md disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed'
        break
      case 'secondary':
        buttonStyle =
          'bg-neutral-200 text-neutral-700 hover:bg-neutral-100 focus:bg-white-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed'
        break
      case 'tertiary':
        buttonStyle =
          'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:bg-white-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed'
        break
      case 'gray':
        buttonStyle = 'bg-[#344054] text-white hover:bg-neutral-800 hover:opacity-75'
        break
      // case 'danger':
      //   buttonStyle = 'bg-error-500 text-white hover:bg-error-500 hover:opacity-75'
      //   break
      case 'white':
        buttonStyle = 'bg-white border border-neutral-200 text-black hover:bg-grey-200 hover:opacity-75'
        break
      default:
        throw new Error('Invalid color passed')
    }
  } else if (variant === 'outlined') {
    switch (color) {
      case 'primary':
        buttonStyle =
          'bg-transparent border border-black-0 enabled:hover:bg-gray-900 text-black-0 enabled:hover:text-white'
        break
      case 'secondary':
        buttonStyle = 'bg-transparent border border-gray-500 hover:border-gray-500 hover:bg-grey-200'
        break

      // case 'success':
      //   buttonStyle =
      //     'bg-transparent border border-success enabled:hover:bg-success text-success enabled:hover:text-white'
      //   break
      case 'danger':
        buttonStyle =
          'bg-transparent border border-error-500 enabled:hover:bg-error-500 text-error-500 enabled:hover:text-white'
        break
      default:
        throw new Error('Invalid color passed')
    }
  } else if (variant === 'outlined-borderless') {
    switch (color) {
      case 'primary':
        buttonStyle =
          'bg-transparent border border-neutral-200 enabled:hover:bg-neutral-50 text-neutral-700 active:box-shadow-md disabled:text-neutral-200'
        break
      // case 'secondary':
      //   buttonStyle = 'bg-transparent border border-gray-500 hover:border-transparent hover:bg-gray-300'
      //   break
      // case 'success':
      //   buttonStyle =
      //     'bg-transparent border border-success enabled:hover:bg-success text-success enabled:hover:text-white'
      //   break
      case 'danger':
        buttonStyle =
          'bg-transparent border border-neutral-200 enabled:hover:bg-error-50 text-error-700 active:box-shadow-md disabled:text-error-200'
        break
      default:
        throw new Error('Invalid color passed')
    }
  }
  return buttonStyle
}

const cls = (input) =>
  input
    .replace(/\s+/gm, ' ')
    .split(' ')
    .filter((cond) => typeof cond === 'string')
    .join(' ')
    .trim()

const Button: React.FC<IButtonProps> = ({
  type = 'button',
  color = 'primary',
  variant = 'contained',
  size = 'sm',
  pill = false,
  className,
  fullWidth,
  children,
  disabled,
  leftIcon,
  rightIcon,
  loader,
  ...rest
}) => (
  <button
    // style={{ display: 'flex', alignItems: 'center', textAlign: "center" }}
    disabled={disabled}
    type={type}
    className={cls(`
  ${classes.base}

  ${classes.size[size]}
  ${renderButtonVariant(variant, color)}
  ${pill && classes.pill}

  ${fullWidth && 'w-full'}
  ${className}
`)}
    {...rest}
  >
    {leftIcon && (
      <div className="pr-2 flex content-center">
        <Image src={leftIcon} alt="document" style={{ height: IMAGE_MAP_SIZE[size], width: IMAGE_MAP_SIZE[size] }} />
      </div>
    )}

    <span style={{ fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
      {children}
      {loader && <Loader />}
    </span>
    {rightIcon && (
      <div className="pl-2 flex content-center">
        <Image src={rightIcon} alt="document" width={20} />
      </div>
    )}
  </button>
)

export default Button
