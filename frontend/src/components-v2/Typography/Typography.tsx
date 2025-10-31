/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC } from 'react'

const VARIANT = {
  subtitle: 'font-inter text-xl font-medium'
}

const COLOR = {
  primary: 'text-neutral-700',
  secondary: 'text-neutral-500',
  tertiary: 'text-neutral-400',
  black: 'text-black',
  gray: 'text-gray-50'
}

interface ITypoegraphyProps {
  variant: 'subtitle' | 'title1' | 'subtitle2' | 'title6' | 'subtitle3'
  color?: 'primary' | 'secondary' | 'tertiary' | 'black' | 'gray'
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
