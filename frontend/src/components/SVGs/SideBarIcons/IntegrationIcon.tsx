import * as React from 'react'
import { ISvgComponentProps } from '../SVGIcon'

const IntegrationIcon: React.FC<Partial<ISvgComponentProps>> = ({
  fill = 'none',
  height = 16,
  stroke = '#777675',
  strokeWidth = 1.5,
  width = 16
}) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 3.3335L9 3.3335M9 3.3335C9 4.43807 9.89543 5.3335 11 5.3335C12.1046 5.3335 13 4.43807 13 3.3335C13 2.22893 12.1046 1.3335 11 1.3335C9.89543 1.3335 9 2.22893 9 3.3335ZM5 8.66683L13 8.66683M5 8.66683C5 9.7714 4.10457 10.6668 3 10.6668C1.89543 10.6668 1 9.7714 1 8.66683C1 7.56226 1.89543 6.66683 3 6.66683C4.10457 6.66683 5 7.56226 5 8.66683Z"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default IntegrationIcon
