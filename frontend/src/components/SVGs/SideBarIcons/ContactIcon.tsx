import * as React from 'react'
import { ISvgComponentProps } from '../SVGIcon'

const ContactIcon: React.FC<Partial<ISvgComponentProps>> = ({
  fill = 'none',
  height = 16,
  stroke = '#777675',
  strokeWidth = 1.5,
  width = 16
}) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.6663 14V10M10.6663 12H14.6663M7.99967 10H5.33301C4.0905 10 3.46924 10 2.97919 10.203C2.32578 10.4736 1.80665 10.9928 1.536 11.6462C1.33301 12.1362 1.33301 12.7575 1.33301 14M10.333 2.19384C11.3103 2.58943 11.9997 3.54754 11.9997 4.66667C11.9997 5.78579 11.3103 6.7439 10.333 7.13949M8.99967 4.66667C8.99967 6.13943 7.80577 7.33333 6.33301 7.33333C4.86025 7.33333 3.66634 6.13943 3.66634 4.66667C3.66634 3.19391 4.86025 2 6.33301 2C7.80577 2 8.99967 3.19391 8.99967 4.66667Z"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default ContactIcon
