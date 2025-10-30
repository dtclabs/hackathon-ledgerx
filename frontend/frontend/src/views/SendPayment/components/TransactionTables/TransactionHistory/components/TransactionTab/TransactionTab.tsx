import React from 'react'
import ReactTooltip from 'react-tooltip'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import TokenImage from '@/components/TokenImage/TokenImage'
import { formatNumber } from '@/utils/formatNumber'
import PriceTooltip from '@/views/SendPayment/components/PriceTooltip/PriceTooltip'
import TokenCircle from '@/components/TokenCircle/TokenCircle'

export interface ITransactionTab {
  index?: number
  address: string
  currentPrice?: any
  hash: string
  pastPrice?: any
  totalAmount: string | number
  token?: any
  tokenSymbol?: string
  isRejectedTransaction: boolean
}

const TransactionTab: React.FC<ITransactionTab> = ({
  index,
  pastPrice,
  currentPrice,
  address,
  hash,
  token,
  totalAmount,
  tokenSymbol,
  isRejectedTransaction
}) => (
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
                {token ? (
                  <TokenImage className="h-4 w-4" tokenAddress={token && token.tokenAddress} />
                ) : (
                  <TokenCircle className="h-4 w-4" symbol={tokenSymbol} />
                )}
                {formatNumber(totalAmount)} {tokenSymbol}
              </div>
              <div className="text-grey-50 text-sm text-medium flex justify-end gap-1 items-center">
                ~ {token && formatNumber(pastPrice, { maximumFractionDigits: 6 })} USD
                <img data-tip data-for={`recipient_${index}_${address}_${hash}`} src="/svg/Info.svg" alt="Info" />
              </div>
            </div>
          </div>
          <ReactTooltip
            id={`recipient_${index}_${address}_${hash}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
            place="left"
          >
            {token ? <PriceTooltip price={currentPrice} /> : 'Unable to fetch price.'}
          </ReactTooltip>
        </div>
      </div>
    )}
  </div>
)

export default TransactionTab
