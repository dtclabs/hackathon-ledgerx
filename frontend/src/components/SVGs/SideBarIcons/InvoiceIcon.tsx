import * as React from 'react'
import { ISvgComponentProps } from '../SVGIcon'

const InvoiceIcon: React.FC<Partial<ISvgComponentProps>> = ({
  fill = 'none',
  height = 16,
  stroke = '#777675',
  strokeWidth = 1.5,
  width = 16
}) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.00033 6L6.33366 7.33333L9.33366 4.33333M12.3337 13V4.2C12.3337 3.0799 12.3337 2.51984 12.1157 2.09202C11.9239 1.71569 11.618 1.40973 11.2416 1.21799C10.8138 1 10.2538 1 9.13366 1H4.86699C3.74689 1 3.18683 1 2.75901 1.21799C2.38269 1.40973 2.07673 1.71569 1.88498 2.09202C1.66699 2.51984 1.66699 3.0799 1.66699 4.2V13L3.50033 11.6667L5.16699 13L7.00033 11.6667L8.83366 13L10.5003 11.6667L12.3337 13Z"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default InvoiceIcon
