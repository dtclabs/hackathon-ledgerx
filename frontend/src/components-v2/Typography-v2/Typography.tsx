/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC } from 'react'

const VARIANT = {
  subtitle: 'font-inter text-xl font-normal',
  subtitle2: 'font-inter text-sm font-sembold',
  // subtitle3: 'font-inter text-sm font-medium',
  title1: 'font-inter text-3xl font-semibold',
  title2: 'font-inter text-2xl font-medium'
  // title6: 'font-inter text-3xl font-semibold'
}

const COLOR = {
  primary: 'text-neutral-700',
  secondary: 'text-neutral-500',
  tertiary: 'text-neutral-400',
  black: 'text-black'
}

interface ITypoegraphyProps {
  variant: 'subtitle' | 'title1' | 'subtitle2' | 'title2' | 'subtitle3'
  color?: 'primary' | 'secondary' | 'tertiary' | 'black'
  children: any
  className?: string
  onClick?: any
  style?: any
}

const Typography: FC<ITypoegraphyProps> = ({
  variant = 'subtitle',
  children,
  color = 'primary',
  className,
  onClick,
  ...rest
}) => (
  <div {...rest} onClick={onClick} className={`${className} ${COLOR[color]} ${VARIANT[variant]}`}>
    {children}
  </div>
)
export default Typography
