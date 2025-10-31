import * as React from 'react'
import { ISvgComponentProps } from '../SVGIcon'

const NewTransferIcon: React.FC<Partial<ISvgComponentProps>> = ({
  fill = 'none',
  height = 24,
  stroke = '#777675',
  strokeWidth = 1.5,
  width = 26
}) => (
  <svg
    style={{ marginLeft: -4 }}
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M6 18L18 6M18 6H10M18 6V14"
      fill="#777675"
    />
  </svg>
)

export default NewTransferIcon
