/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React from 'react'
import ReactTooltip from 'react-tooltip'
import { useTransactionTotal } from '@/hooks/useTransactionTotal'
import { toPlainString } from '@/utils/eToNumber'
import { formatNumber } from '@/utils/formatNumber'
import PriceTooltip from '../PriceTooltip/PriceTooltip'

export const formatNum = (num) => String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,')

interface ITotalAmount {
  transaction: any
  price: any
  type: 'TOKEN' | 'USD'
  index?: number
  noPastPrice?: boolean
  pastPrice?: any
  currentPrice?: any
  place?: any
  hash: string
}

const TotalAmount = ({
  transaction,
  type,
  price,
  index,
  noPastPrice = false,
  pastPrice,
  currentPrice,
  place,
  hash
}: ITotalAmount) => {
  const { total, totalUSD, loadingTotal } = useTransactionTotal(transaction, price)

  return (
    <span>
      {noPastPrice ? (
        loadingTotal ? (
          <div className="animate-pulse">
            <div className="w-20 h-3.5 rounded-md bg-gray-300" />
          </div>
        ) : (
          formatNumber(totalUSD, { maximumFractionDigits: 6 })
        )
      ) : (
        (type === 'USD' &&
          (loadingTotal ? (
            <div className="w-20 h-3.5 rounded-md bg-gray-300" />
          ) : (
            <>
              <div>
                <div className="flex gap-1 items-center">
                  {pastPrice
                    ? formatNumber(pastPrice, { useGrouping: true, maximumFractionDigits: 6 })
                    : formatNumber(currentPrice, { useGrouping: true, maximumFractionDigits: 6 })}{' '}
                  USD
                  <img data-tip data-for={`transaction_${index}_${hash}`} src="/svg/Info.svg" alt="Info" />
                </div>
              </div>

              <ReactTooltip
                id={`transaction_${index}_${hash}`}
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg"
                place={place}
              >
                <PriceTooltip price={currentPrice} />
              </ReactTooltip>
            </>
          ))) ||
        (type === 'TOKEN' && total && (total.length <= 3 ? total : formatNum(toPlainString(Number(total).toFixed(15)))))
      )}
    </span>
  )
}

export default TotalAmount
