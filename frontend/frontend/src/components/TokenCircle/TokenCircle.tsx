import React from 'react'

interface ITokenCircle {
  symbol?: string
  className: string
}

const TokenCircle: React.FC<ITokenCircle> = ({ symbol, className }) => (
  <div
    title={symbol || 'Unknown Token'}
    className={` ${className} rounded-full uppercase text-[10px] flex items-center justify-center leading-3 font-semibold text-white bg-grey-900 `}
  >
    {(symbol && symbol.charAt(0)) || '?'}
  </div>
)
export default TokenCircle
