import React from 'react'
import { Tailwindest } from 'tailwindest'

export interface ITypographyProps {
  variant?:
    | 'display1'
    | 'display2'
    | 'display3'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'overline'
  styleVariant?: 'semibold' | 'underline' | 'medium' | 'regular'
  color?: 'primary' | 'secondary' | 'tertiary' | 'black' | 'error' | 'success' | 'dark' | 'warning' | 'info' | 'discription'
  children: React.ReactNode
  classNames?: any
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
}

const componentMapping = {
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  subtitle1: 'h6',
  subtitle2: 'h6'
}

const typeVariantMapping = {
  display1: 'font-epilogue text-5xl font-bold leading-[3.75rem]',
  display2: 'font-epilogue text-[2.5rem] font-bold leading-[3.25rem]',
  display3: 'font-epilogue text-[2.25rem] leading-[2.5rem] font-bold',
  heading1: 'font-epilogue text-[2rem] leading-[2.5rem] font-bold',
  heading2: 'font-epilogue text-[1.5rem] leading-[2rem] font-bold',
  heading3: 'font-epilogue text-[1.25rem] leading-[1.75rem] font-bold',
  subtitle1: 'font-inter text-[1rem] leading-[1.5rem] font-semibold',
  subtitle2: 'font-inter text-[0.875rem] leading-[1.25rem] font-semibold',
  body1: 'font-inter text-[1rem] leading-[1.25rem]',
  body2: 'font-inter text-[0.875rem] leading-[1.125rem]',
  caption: 'font-inter text-[0.75rem] leading-[1rem]',
  overline: 'font-inter text-[0.625rem] leading-[0.875rem] font-semibold tracking-widest uppercase'
}

const styleVariantMapping = {
  semibold: 'font-semibold',
  underline: 'underline',
  medium: 'font-medium',
  regular: 'font-normal'
}

const colorMapping = {
  primary: 'text-neutral-700',
  secondary: 'text-neutral-500',
  tertiary: 'text-neutral-400',
  black: 'text-black',
  dark: 'text-dashboard-main',
  error: 'text-[#C61616]',
  success: 'text-[#0CB746]',
  warning: 'text-[#E9740B]',
  info: 'text-[#006FAD]',
  discription: 'text-[#777675]'
}

/**
 * Primary Typography component
 */
const Typography = ({
  variant = 'body2',
  color = 'primary',
  children,
  styleVariant,
  classNames,
  href,
  target = '_blank',
  rel = 'noreferrer noopener',
  ...rest
}: ITypographyProps) => {
  const Component = href ? 'a' : variant && componentMapping[variant] ? componentMapping[variant] : 'p'
  const commonClasses = `${typeVariantMapping[variant]} ${styleVariant ? styleVariantMapping[styleVariant] : ''} ${
    colorMapping[color]
  } ${classNames}`

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={commonClasses} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <Component className={commonClasses} {...rest}>
      {children}
    </Component>
  )
}

export default Typography
