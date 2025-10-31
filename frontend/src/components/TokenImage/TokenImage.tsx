import React from 'react'
import useFreeContext from '@/hooks/useFreeContext'
import { getTokenImageBySymbol } from '@/utils/getTokenImageBySymbol'

export interface ITokenImage {
  tokenAddress?: string
  imageSrc?: string
  className?: string
  type?: 'tokenAddress' | 'tokenURL'
  symbol?: string
}

const TokenImage: React.FC<ITokenImage> = ({ tokenAddress, className, type = 'tokenAddress', imageSrc, symbol }) => {
  const { tokens } = useFreeContext()
  const src =
    tokens?.find(
      (token) => token.tokenAddress && tokenAddress && token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
    ) ||
    (tokenAddress === '' && tokens[0])

  const tokenUrlBySymbol = getTokenImageBySymbol(symbol)
  return (
    (type === 'tokenAddress' &&
      (src && src.logoUrl ? (
        <img className={className} alt="token" src={src.logoUrl} />
      ) : (
        <div className={`rounded-full bg-gray-400 ${className}`} />
      ))) ||
    (type === 'tokenURL' && imageSrc && (
      <img className={className} alt="token" src={imageSrc || tokens[0].logoUrl} />
    )) ||
    (symbol &&
      (tokenUrlBySymbol ? (
        <img className={className} alt="token" src={tokenUrlBySymbol} />
      ) : (
        <div
          title={symbol || 'Unknown Token'}
          className={` ${className} rounded-full uppercase text-[10px] flex items-center justify-center leading-3 font-semibold text-white bg-grey-900 `}
        >
          {(symbol && symbol.charAt(0)) || '?'}
        </div>
      )))
  )
}

export default TokenImage
