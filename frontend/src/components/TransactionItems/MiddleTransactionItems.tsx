import { IToken } from '@/hooks/useNetwork'
import { formatNumber } from '@/utils/formatNumber'
import { truncateNumber } from '@/utils/truncateNumber'
import PriceTooltip from '@/views/SendPayment/components/PriceTooltip/PriceTooltip'
import React from 'react'
import ReactTooltip from 'react-tooltip'
import TokenImage from '../TokenImage/TokenImage'
import WalletAddress from '../WalletAddress/WalletAddress'

export interface IMiddleTransactionItems {
  title: string
  time: string
  safeName: string
  incomingAddress: string
  functionName: string
  sourceName: string
  token: IToken
  isRejectTransaction?: boolean
  symbol: string
  amount: string
  to: string
  from: string
  totalPastPriceUSD: number
  nonce: string
  hash: string
  totalCurrentPriceUSD: number
  isContractInteraction: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  category: string
}

const MiddleTransactionItems: React.FC<IMiddleTransactionItems> = ({
  amount,
  hash,
  to,
  from,
  isRejectTransaction,
  functionName,
  isContractInteraction,
  incomingAddress,
  nonce,
  safeName,
  sourceName,
  symbol,
  time,
  title,
  token,
  totalCurrentPriceUSD,
  totalPastPriceUSD,
  onClick,
  category
}) => (
  <button type="button" onClick={onClick} className="flex items-center">
    <div className="pr-6 border-r border-[#EBEDEF] min-w-[250px] max-w-[250px] text-left">
      <div className="text-grey-900 font-medium capitalize text-base">
        {sourceName ? (
          <div className="flex">
            <div className="normal-case truncate">{sourceName}</div>
          </div>
        ) : !isContractInteraction ? (
          title
        ) : (
          'No Recipients'
        )}
      </div>
      {time && <p className="text-grey-50 text-sm text-medium">{time}</p>}
      {safeName && (
        <div className="flex w-full text-sm">
          <div className=" pr-2 text-dashboard-sub">From</div>
          <WalletAddress
            address={from}
            noAvatar
            noColor
            showFirst={5}
            showLast={4}
            className="text-sm leading-5"
            maxWidth="w-[200px]"
          />
        </div>
      )}
      {incomingAddress && (
        <div className="flex text-sm">
          <div className=" pr-2 text-dashboard-sub">From</div>
          <WalletAddress
            address={incomingAddress}
            noAvatar
            noColor
            showFirst={5}
            maxWidth="w-[200px]"
            showLast={4}
            className="text-sm leading-5"
          />
        </div>
      )}
    </div>
    <div className="pl-6  flex items-center min-w-[335px] gap-6">
      <div className="min-w-[150px] max-w-[150px]">
        {!symbol ? (
          <div>
            <div className="text-base text-dashboard-main font-medium font-inter whitespace-nowrap capitalize text-left">
              Contract interaction
            </div>
            <div className="text-base text-dashboard-sub font-medium font-inter whitespace-nowrap capitalize text-left truncate">
              {functionName || 'Unknown'}
            </div>
          </div>
        ) : (
          <div className="flex items-center whitespace-nowrap gap-1 truncate">
            <TokenImage className="h-4 w-4" type="tokenURL" symbol={symbol} imageSrc={token && token.logoUrl} />
            <div className="text-base text-dashboard-main font-medium font-inter truncate">
              {amount} {symbol}
            </div>
          </div>
        )}
        <div
          className="text-sm text-dashboard-sub whitespace-nowrap text-left font-inter mt-1"
          data-tip
          data-for={`total_${nonce}_${hash}`}
        >
          {isContractInteraction
            ? ''
            : ((totalPastPriceUSD || totalCurrentPriceUSD) &&
                `~ $${formatNumber(truncateNumber(+totalPastPriceUSD || +totalCurrentPriceUSD, 3), {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 0
                })} USD`) ||
              (symbol && 'Unsupported')}
        </div>
        {/* <div className="text-grey-900 text-sm flex gap-1 items-center">
            {totalPastPriceUSD}
            {tooltip && <img data-tip data-for={`total_${nonce}_${hash}`} src="/svg/Info.svg" alt="Info" />}
          </div> */}
        {totalPastPriceUSD ? (
          <ReactTooltip
            id={`total_${nonce}_${hash}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            {token ? <PriceTooltip price={totalCurrentPriceUSD || 0} /> : 'Unable to fetch price.'}
          </ReactTooltip>
        ) : (
          ''
        )}
      </div>
      {category && <div className="text-left">{category}</div>}
    </div>
  </button>
)

export default MiddleTransactionItems
