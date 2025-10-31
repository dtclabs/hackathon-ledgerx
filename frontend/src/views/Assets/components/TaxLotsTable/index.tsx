import PaginateTransactions from '@/components/PaginateTransactions'
import React from 'react'
import { ITaxLot } from '../TaxLots'
import TaxLotRow from './TaxLotRow'
import Asset from '@/public/svg/Document.svg'
import Direction from '@/public/svg/Direction.svg'
import Image from 'next/legacy/image'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import NotFound from '@/components/NotFound'

interface ITaxLotsTable {
  data: ITaxLot[]
  asset: string
  size: number
  setSize: (size: number) => void
  page: number
  setPage: (page: number) => void
  totalItems: number
  totalPages: number
  onChangeDirection: () => void
  direction: boolean
}

const TaxLotsTable: React.FC<ITaxLotsTable> = ({
  data,
  asset,
  size,
  setSize,
  page,
  setPage,
  totalItems,
  totalPages,
  direction,
  onChangeDirection
}) => {
  const showBanner = useAppSelector(showBannerSelector)
  return (
    <>
      <div className="font-inter border-[1px] border-dashboard-border rounded-lg rounded-tl-none overflow-auto scrollbar w-full">
        <div className="min-w-fit">
          <div className="bg-grey-100 flex items-center py-[13px] text-grey-700 font-semibold leading-[18px] text-xs border-b-[1px]">
            <div className="pl-6 w-[8%] min-w-[92px]">Lot#</div>
            <div className="pl-6 w-[12%] min-w-[160px] flex items-center gap-[6px]">
              <p>Lot Txn Date & Time</p>
              {data && data.length > 0 && (
                <Image
                  src={Direction}
                  onClick={onChangeDirection}
                  className={`${direction && 'rotate-180'} cursor-pointer`}
                />
              )}
            </div>
            <div className="pl-6 w-[12%] min-w-[140px]">Lot Amount</div>
            <div className="pl-6 w-[12%] min-w-[140px]">Lot Price</div>
            <div className="pl-6 w-[12%] min-w-[140px]">Cost Basis</div>
            <div className="pl-6 w-[10%] min-w-[100px]">Last Update</div>
            <div className="pl-6 w-[12%] min-w-[120px]">Wallet</div>
            <div className="pl-6 w-[22%] min-w-[220px]">Remaining Amount</div>
          </div>
        </div>
        <div className={`${showBanner ? 'h-[calc(100vh-424px)]' : 'h-[calc(100vh-356px)]'} overflow-auto scrollbar`}>
          {data && data.length > 0 ? (
            data.map((item) => item && <TaxLotRow key={item.id} taxLot={item} asset={asset} />)
          ) : (
            <div className="my-0 mx-auto">
              <NotFound title="No tax lots found" icon={Asset} extendWrapperClassName="pt-16" />
            </div>
          )}
        </div>
      </div>
      {data && data.length > 0 && (
        <div className="flex gap-4 items-center mt-2">
          <PaginateTransactions
            size={Number(size)}
            currentPage={page}
            setPage={setPage}
            totalItems={totalItems}
            totalPages={totalPages}
          />
          {/* <ItemPerPage
          size={size}
          setSize={setSize}
          setPage={setPage}
          title="Rows per page"
          dataPaginate={dataPaginate.map((item) => item.size)}
        /> */}
        </div>
      )}
    </>
  )
}

export default TaxLotsTable
