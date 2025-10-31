import React, { useMemo } from 'react'
import { formatNumber } from '@/utils/formatNumber'
import { IReviewTaxLotData } from '.'
import Image from 'next/legacy/image'
import Decrease from '@/public/svg/Decrease.svg'

interface ReviewTaxLotsRow {
  taxLot: IReviewTaxLotData
  asset: string
  newPrice: number
  lastRow?: boolean
  setTotalLoss: (totalLoss: number) => void
}
const ReviewTaxLotsRow: React.FC<ReviewTaxLotsRow> = ({ taxLot, lastRow, asset, newPrice, setTotalLoss }) => {
  const loss = useMemo(() => {
    const totalLoss = taxLot.price * taxLot.amount - newPrice * taxLot.amount
    setTotalLoss(totalLoss)
    return totalLoss
  }, [newPrice, taxLot.amount, taxLot.price])

  return (
    <div
      className={`flex items-center text-xs leading-[18px] font-medium py-3 ${
        !lastRow && 'border-b border-dashboard-border'
      }`}
    >
      <div className="pl-6 w-[12%] min-w-[80px]">{taxLot.lotId}</div>
      <div className="pl-6 w-[22%] min-w-[155px]">
        {taxLot.amount} {asset}
      </div>
      <div className="pl-6 w-[22%] min-w-[155px]">{`$${formatNumber(taxLot.price * taxLot.amount, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })} USD`}</div>
      <div className="pl-6 w-[22%] min-w-[155px]">{`$${formatNumber(newPrice * taxLot.amount, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })} USD`}</div>
      <div className="pl-6 w-[22%] min-w-[155px] flex items-center text-[#C61616] gap-1">
        <Image src={Decrease} width={12} height={12} />
        <div>{`$${formatNumber(loss, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        })} USD`}</div>
      </div>
    </div>
  )
}

export default ReviewTaxLotsRow
