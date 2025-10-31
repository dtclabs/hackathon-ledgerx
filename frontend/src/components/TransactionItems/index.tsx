import { IToken } from '@/hooks/useNetwork'
import { ITransaction } from '@/slice/old-tx/interface'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { currencyToWord, toNearestDecimal } from '@/utils-v2/numToWord'
import { getTransactionMethod } from '@/utils/getTransactionMethod'
import { toShort } from '@/utils/toShort'
import React from 'react'
import ReactTooltip from 'react-tooltip'
import TokenImage from '../TokenImage/TokenImage'
import Typography from '@/components-v2/atoms/Typography'
import { formatNumber } from '@/utils/formatNumber'

export interface ITransactionItems {
  currentNonce?: number
  label?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  isExpanded?: boolean
  title: string
  time?: string
  token: IToken
  valueTransaction: ITransaction
  symbol: string
  amount: string
  isChecked?: boolean
  noArrow?: boolean
  incomingAddress?: string
  sourceName?: string
  safeName?: string
  nonce?: string
  action?: boolean | React.ReactNode
  totalPastPrice?: number
  numberOfAssets?: number
  onSelectTransaction: (item: ITransaction) => void
  selectedList: ITransaction[]
  isContractInteraction: boolean
  setSelectedList: (value) => void
}

const TransactionItems: React.FC<ITransactionItems> = ({
  title,
  isExpanded,
  onClick,
  valueTransaction,
  symbol,
  time,
  token,
  amount,
  sourceName,
  nonce,
  action,
  label,
  totalPastPrice,
  numberOfAssets,
  isContractInteraction
}) => {
  const { country: countrySetting, fiatCurrency: fiatCurrencySetting } = useAppSelector(orgSettingsSelector)

  return (
    <div
      className={`${
        isExpanded ? 'bg-blanca-50' : 'bg-white'
      } flex items-center justify-between flex-1 cursor-pointer p-4 text-grey-800 rounded-b-lg`}
      aria-hidden
      onClick={() => {
        onClick()
      }}
    >
      <div className="flex items-center w-[207px] mr-6">
        {nonce && (
          <Typography variant="body2" classNames="mr-3 w-8">
            {nonce}
          </Typography>
        )}
        <div>
          <div className="text-grey-800 font-medium capitalize text-base">
            {sourceName ? (
              <div className="flex">
                <Typography
                  variant="body1"
                  data-tip
                  data-for={`source_name_${nonce}_${valueTransaction.hash}`}
                  classNames="truncate !text-[#535251] !font-normal"
                >
                  {sourceName.length > 16 ? toShort(sourceName, 16, 0) : sourceName}
                </Typography>
                {sourceName.length > 16 && (
                  <ReactTooltip
                    id={`source_name_${nonce}_${valueTransaction.hash}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg"
                  >
                    {sourceName}
                  </ReactTooltip>
                )}
              </div>
            ) : !isContractInteraction ? (
              <Typography variant="body1" classNames="!text-[#535251] !font-normal">
                {title}
              </Typography>
            ) : (
              <Typography variant="body1" classNames="!text-[#535251] !font-normal">
                No Recipients
              </Typography>
            )}
          </div>
          {time && (
            <Typography variant="body2" classNames="!text-[#777675] mt-1">
              {time}
            </Typography>
          )}
        </div>
      </div>

      <div className="min-w-[150px] max-w-[150px]">
        {!symbol ? (
          <div>
            <div className="text-base text-dashboard-main font-medium font-inter whitespace-nowrap capitalize text-left">
              {valueTransaction.isRejectTransaction ? '-' : 'Contract interaction'}
            </div>
            <div className="text-sm text-dashboard-sub font-medium font-inter whitespace-nowrap capitalize text-left truncate">
              {(valueTransaction.method && getTransactionMethod(valueTransaction.method)) ||
                (valueTransaction.isRejectTransaction ? '' : 'Unknown')}
            </div>
          </div>
        ) : numberOfAssets > 1 ? (
          <Typography variant="body1" classNames="truncate">
            {numberOfAssets} Assets
          </Typography>
        ) : (
          <div className="flex items-center whitespace-nowrap gap-1 truncate">
            <TokenImage className="h-4 w-4" type="tokenURL" symbol={symbol} imageSrc={token && token.logoUrl} />
            <Typography variant="body1" classNames="truncate">
              {toNearestDecimal(amount, countrySetting?.iso, 5)} {symbol}
            </Typography>
          </div>
        )}
        <div
          className="text-sm text-grey-700 whitespace-nowrap text-left font-inter mt-1"
          data-tip
          data-for={`total_${nonce}_${valueTransaction.hash}`}
        >
          {!valueTransaction.recipients || valueTransaction.isRejectTransaction
            ? ''
            : (totalPastPrice !== undefined &&
                `~ ${fiatCurrencySetting?.symbol}${currencyToWord(
                  `${totalPastPrice}`,
                  null,
                  countrySetting?.iso,
                  3
                )} ${valueTransaction.recipients[0]?.fiatCurrency?.toUpperCase()}`) ||
              (symbol && 'Unsupported')}
        </div>
        {totalPastPrice ? (
          <ReactTooltip
            id={`total_${nonce}_${valueTransaction.hash}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            {token ? (
              <div className="text-center">
                Displaying value at time of transaction.
                <p className="pt-1">
                  Current Price of Asset is{' '}
                  <span className="font-semibold">
                    {formatNumber(totalPastPrice || 0, { useGrouping: true, maximumFractionDigits: 6 })}
                  </span>{' '}
                  {valueTransaction.recipients[0]?.fiatCurrency?.toUpperCase() ?? ''}
                </p>
              </div>
            ) : (
              'Unable to fetch price.'
            )}
          </ReactTooltip>
        ) : (
          ''
        )}
      </div>
      {/* </div> */}
      <div className="items-center flex min-w-[127px] 3xl:mr-0 mr-[80px] ">{label && label}</div>
      {/* </div> */}
      <div className="w-[215px]">{action}</div>
    </div>
  )
}

export default TransactionItems
