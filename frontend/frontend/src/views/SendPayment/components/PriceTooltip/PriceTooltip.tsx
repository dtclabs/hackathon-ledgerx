import React from 'react'
import { formatNumber } from '@/utils/formatNumber'

const PriceTooltip = ({ price }) => (
  <div className="text-center">
    Displaying value at time of transaction.
    <p className="pt-1">
      Current Price of Asset is{' '}
      <span className="font-semibold">{formatNumber(price, { useGrouping: true, maximumFractionDigits: 6 })}</span> USD
    </p>
  </div>
)

export default PriceTooltip
