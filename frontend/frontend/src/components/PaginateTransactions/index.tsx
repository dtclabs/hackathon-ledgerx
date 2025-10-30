import Image from 'next/legacy/image'
import React from 'react'
import chevron from '@/public/svg/ChevronUp.svg'

export interface IPaginateTransactions {
  size: number
  currentPage: number
  setPage: (page: number) => void
  totalItems: number
  totalPages: number
}

const PaginateTransactions: React.FC<IPaginateTransactions> = ({
  size,
  currentPage,
  totalItems,
  totalPages,
  setPage
}) => (
  <div className="bg-white border whitespace-nowrap border-dashboard-border-200 rounded-lg flex items-center gap-4 px-3 py-[8px]">
    <button
      disabled={currentPage === 0}
      type="button"
      className="-rotate-90 disabled:cursor-not-allowed w-3 h-3 mr-2"
      onClick={() => setPage(currentPage - 1)}
    >
      <Image src={chevron} alt="arrow-left" width={12} height={12} />
    </button>
    <div className="text-xs leading-[18px] text-dashboard-main font-medium">{`${
      totalPages === 0 ? 0 : currentPage * size + 1
    } - ${
      currentPage * size + size > totalItems ? totalItems : Number(currentPage * size + size)
    } of ${totalItems}`}</div>
    <button
      disabled={totalPages === 0 || totalPages === currentPage + 1}
      type="button"
      className="rotate-90 disabled:cursor-not-allowed w-3 h-3 ml-2"
      onClick={() => setPage(currentPage + 1)}
    >
      <Image src={chevron} alt="arrow-left" width={12} height={12} />
    </button>
  </div>
)

export default PaginateTransactions
