import React from 'react'

export interface ITablePaginationProps {
  size: number
  currentPage: number
  setPage: (page: number) => void
  totalItems: number
  totalPages: number
  onePageBack: any
  onePageForward: any
  canPreviousPage: any
  canNextPage: any
}

const TablePagination: React.FC<ITablePaginationProps> = ({
  size,
  currentPage,
  totalItems,
  totalPages,
  setPage,
  onePageBack,
  onePageForward,
  canPreviousPage,
  canNextPage
}) => (
  <div className="bg-white border whitespace-nowrap border-dashboard-border-200 rounded-lg flex items-center gap-1 px-3 py-[9px]">
    <button
      disabled={!canPreviousPage}
      type="button"
      className={`disabled:cursor-not-allowed p-1 ${!canPreviousPage && 'hover:bg-grey-200 hover:rounded-md'}`}
      onClick={() => setPage(0)}
    >
      <img src="/svg/ChevronDouble.svg" alt="arrow-left" width={12} height={12} />
    </button>
    <button
      disabled={!canPreviousPage}
      type="button"
      className={`disabled:cursor-not-allowed p-1 ${currentPage !== 0 && 'hover:bg-grey-200 hover:rounded-md'}`}
      onClick={onePageBack}
    >
      <img src="/svg/chevron-left.svg" alt="arrow-left" width={12} height={12} />
    </button>
    <div className="text-xs leading-[18px] text-dashboard-main font-medium px-3">{`${
      totalPages === 0 ? 0 : currentPage * size + 1
    } - ${
      currentPage * size + size > totalItems ? totalItems : Number(currentPage * size + size)
    } of ${totalItems}`}</div>
    <button
      disabled={!canNextPage}
      type="button"
      className={`disabled:cursor-not-allowed p-1 ${!canNextPage ? '' : 'hover:bg-grey-200 hover:rounded-md'}`}
      onClick={onePageForward}
    >
      <img src="/svg/chevron-right.svg" alt="arrow-left" width={12} height={12} />
    </button>
    <button
      disabled={currentPage === totalPages - 1}
      type="button"
      className={`-rotate-180 disabled:cursor-not-allowed p-1 ${
        currentPage !== totalPages - 1 && 'hover:bg-grey-200 hover:rounded-md'
      }`}
      onClick={() => setPage(totalPages - 1)}
    >
      <img src="/svg/ChevronDouble.svg" alt="arrow-left" width={12} height={12} />
    </button>
  </div>
)

export default TablePagination
