/**
 * Documentation for communication with design team
 * Mapping colors in the design to colors used in this file
 * ----------------------------------------
 * Code term (variant) - Design file name
 * ----------------------------------------
 * black - primary
 * grey - subtle grey
 * ghost - ghost
 * whiteWithBlackBorder - secondary
 * redfilled - primary destructive
 * redOutlined - secondary destructive
 * ghostRed - ghost destructive
 */

/* eslint-disable react/button-has-type */
import React from 'react'
import Image from 'next/legacy/image'
import loadingImage from '@/public/image/Load.png'
import LockIcon from '@/public/svg/icons/lock-icon.svg'
import BlackLockIcon from '@/public/svg/icons/black-lock-icon.svg'
import { type Tailwindest } from 'tailwindest'

type TailwindWidth = Tailwindest['width']

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant:
    | 'black'
    | 'grey'
    | 'ghost'
    | 'transparent'
    | 'whiteWithBlackBorder'
    | 'redfilled'
    | 'redOutlined'
    | 'ghostRed'
    | 'yellow'
    | 'orangeOutlined'
    | 'greenOutlined'
    | 'blue'
    | 'blueOutlined'
  type?: 'reset' | 'submit' | 'button'
  height: 64 | 52 | 48 | 40 | 32 | 24
  trailingIcon?: JSX.Element
  leadingIcon?: JSX.Element
  loading?: boolean
  loadingWithLabel?: boolean
  label?: string | JSX.Element
  disabled?: boolean
  width?: TailwindWidth
  classNames?: string
  locked?: boolean
  buttonRef?: any
}

const variantMapping = {
  blue: 'bg-blue-500 text-white p-3.5 font-inter rounded hover:enabled:bg-blue-600 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] focus:shadow-buttonFocusPurple disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  blueOutlined:
    'bg-white-200 text-[#0057BF] p-3.5 font-inter font-medium rounded border border-[#0057BF] hover:enabled:bg-blue-50 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  black:
    'bg-black-19 text-white p-3.5 font-inter rounded hover:enabled:bg-indigo-6 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] focus:shadow-buttonFocusPurple disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  grey: 'bg-grey-200 border border-grey-200 text-pink-200 p-3.5 font-inter font-medium rounded hover:enabled:bg-blanca-100 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] hover:enabled:border hover:enabled:border-blanca-400 text-sm tracking-[0.01em] focus:shadow-buttonFocusPurple disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'bg-white text-pink-200 p-3.5 font-inter rounded border border-grey-200 hover:enabled:bg-grey-100 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] hover:enabled:border-blanca-400 text-sm tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  whiteWithBlackBorder:
    'bg-white-200 text-black-19 p-3.5 font-inter font-medium rounded border border-black-19 hover:enabled:bg-grey-100 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] hover:enabled:border hover:enabled:border-indigo-6 hover:enabled:text-indigo-6 text-sm tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  redfilled:
    'bg-error-500 text-white p-3.5 font-inter rounded hover:enabled:bg-error-700 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] focus:shadow-buttonFocusPurple disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  redOutlined:
    'bg-white-200 text-error-500 p-3.5 font-inter font-medium rounded border border-error-500 hover:enabled:bg-error-50 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  orangeOutlined:
    'bg-white-200 text-[#E9740B] p-3.5 font-inter font-medium rounded border border-[#F5BF8F] hover:enabled:bg-[#FBE4D0] hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  greenOutlined:
    'bg-white-200 text-[#0CB746] p-3.5 font-inter font-medium rounded border border-[#0CB746] hover:enabled:bg-[#CFFCDE] hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  ghostRed:
    'bg-white text-error-500 p-3.5 font-inter rounded border border-grey-200 hover:enabled:bg-error-50 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] hover:enabled:border-blanca-400 text-sm tracking-[0.01em] focus:border-blanca-400 disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  yellow:
    'bg-[#FCF22D] text-black-19 p-3.5 font-inter rounded hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm font-medium tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed',
  transparent:
    'bg-transparent text-pink-200 p-3.5 font-inter rounded border border-grey-200 hover:bg-white text-sm tracking-[0.01em] disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed'
}

const heightMapping = {
  64: 'h-[64px]',
  52: 'h-[52px]',
  48: 'h-[48px]',
  40: 'h-[40px]',
  32: 'h-[32px]',
  24: 'h-[24px]'
}

const Button: React.FC<IButtonProps> = ({
  buttonRef: ref,
  variant,
  height,
  width,
  disabled,
  type,
  loading,
  label,
  leadingIcon,
  trailingIcon,
  classNames,
  locked,
  loadingWithLabel, // TODO-PENDING Improve this later and make it a common loading
  ...rest
}) => (
  <button
    className={`${variantMapping[variant]} ${heightMapping[height]} ${
      width || ''
    } flex items-center justify-center gap-2 ${classNames}`}
    disabled={disabled}
    type={type || 'button'}
    ref={ref}
    {...rest}
  >
    {!loading && (
      <>
        {leadingIcon || ''}
        {label ? typeof label === 'string' ? <span>{label}</span> : label : ''}
        {loadingWithLabel && <Image src={loadingImage} alt="loading" width={15} height={15} className="animate-spin" />}
        {trailingIcon || ''}
        {locked && <Image src={variant === 'black' ? LockIcon : BlackLockIcon} width={14} height={14} />}
      </>
    )}
    {loading && <Image src={loadingImage} alt="loading" width={15} height={15} className="animate-spin" />}
  </button>
)

export default Button
