import React from 'react'
import ReviewTaxLotsRow from './ReviewTaxLotsRow'

export interface IReviewTaxLotData {
  lotId: string
  amount: number
  price: number
}

interface IReviewTaxLots {
  data: IReviewTaxLotData[]
  newPrice: number
  asset: string
  loss: 'Impairment Loss' | 'Unrealised Gain/Loss'
  setTotalLoss: (totalLoss: number) => void
}

const ReviewTaxLots: React.FC<IReviewTaxLots> = ({ data, asset, newPrice, loss, setTotalLoss }) => (
  <div className="font-inter border border-dashboard-border rounded-lg overflow-auto scrollbar w-full">
    <div className="min-w-fit">
      <div className="bg-grey-100 flex items-center py-[13px] text-grey-700 font-semibold leading-[18px] text-xs border-b">
        <div className="pl-6 w-[12%] min-w-[80px]">Lot#</div>
        <div className="pl-6 w-[22%] min-w-[155px]">Affected Lot Amount</div>
        <div className="pl-6 w-[22%] min-w-[155px]">Previous Book Value</div>
        <div className="pl-6 w-[22%] min-w-[155px]">New Book Value</div>
        <div className="pl-6 w-[22%] min-w-[155px]">{loss}</div>
      </div>
    </div>
    <div className="max-h-[200px]">
      {data &&
        data.length > 0 &&
        data.map(
          (item, index) =>
            item && (
              <ReviewTaxLotsRow
                key={item.lotId}
                newPrice={newPrice}
                taxLot={item}
                asset={asset}
                lastRow={index === data.length - 1}
                setTotalLoss={setTotalLoss}
              />
            )
        )}
    </div>
  </div>
)

export default ReviewTaxLots
