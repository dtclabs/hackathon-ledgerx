import React from 'react'
import ReactTooltip from 'react-tooltip'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import TokenImage from '@/components/TokenImage/TokenImage'
import { formatNumber } from '@/utils/formatNumber'
import useFreeContext from '@/hooks/useFreeContext'
import TokenCircle from '@/components/TokenCircle/TokenCircle'

export interface IRecipientItem {
  index?: number
  address: string
  tokenAddress: string
  currentPrice?: string | number
  hash: string
  totalAmount?: string | number
  symbol?: string
  isRejectedTransaction?: boolean
}

const RecipientItem: React.FC<IRecipientItem> = ({
  index,
  currentPrice,
  address,
  tokenAddress,
  hash,
  totalAmount,
  symbol,
  isRejectedTransaction
}) => {
  const { tokens, networkConfig } = useFreeContext()
  const src =
    tokens.find(
      (token) => token.tokenAddress && tokenAddress && token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
    ) ||
    (tokenAddress === '' && tokens[0])
  return (
    <div className="w-full  flex justify-between items-center rounded-b-lg">
      <div className="py-6 text-grey-900 font-semibold flex items-center gap-4">
        <WalletAddress address={address} noColor showFirst={5} showLast={4} />
      </div>
      {!isRejectedTransaction && (
        <div>
          <div className="text-sm w-full items-center text-right text-grey-50 font-medium pl-6 justify-end flex gap-1">
            <div>
              <div className="py-2 ">
                <div className="flex justify-end items-center gap-2 text-grey-900 font-semibold">
                  {src ? (
                    <TokenImage className="h-4 w-4" tokenAddress={tokenAddress} />
                  ) : (
                    <TokenCircle className="h-4 w-4" symbol={symbol} />
                  )}
                  {formatNumber(totalAmount)} {symbol || networkConfig.nativeToken}
                </div>
                <div className="flex gap-1 items-center  justify-end">
                  <p className="text-grey-50 text-sm text-medium">
                    ~ {src && formatNumber(currentPrice, { maximumFractionDigits: 6 })} USD
                  </p>
                  {!src && <img data-tip data-for={`recipient_${index}_${hash}`} src="/svg/Info.svg" alt="Info" />}
                </div>
              </div>
              {!src && (
                <ReactTooltip
                  id={`recipient_${index}_${hash}`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg"
                  place="left"
                >
                  Unable to fetch price.
                </ReactTooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipientItem
