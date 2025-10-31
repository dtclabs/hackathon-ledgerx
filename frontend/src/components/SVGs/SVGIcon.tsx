import React from 'react'
import { IconMap } from './library/library'

export interface ISvgComponentProps {
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
}

export interface IconProps extends Partial<ISvgComponentProps> {
  name: keyof typeof IconMap
}
const SVGIcon: React.FC<IconProps> = ({ name, width = 12, height = 12, ...rest }) => {
  const MatchIcon = IconMap[name] || null
  if (!MatchIcon) return null
  return <MatchIcon width={width} height={height} {...rest} />
}

export { SVGIcon }
