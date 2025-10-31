/* eslint-disable no-else-return */
/* eslint-disable react/no-array-index-key */
/* eslint-disable consistent-return */

import RowsPerPage from '@/components/ItemsPerPage/ItemPerPage'
import { log } from '@/utils-v2/logger'
import { ReactNode, useMemo } from 'react'

const DOTS = '...'

const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, index) => index + start)
}

const renderRowsPerPage = (rowsPerPage: number, rowsPerPageOptions: number[], element: any): any => {
  try {
    if (rowsPerPageOptions.includes(rowsPerPage)) {
      return element
    }
  } catch (err) {
    return {}
  }
}

export interface IPagination {
  siblingCount?: number
  firstCount?: number
  lastCount?: number
  totalPages: number
  currentPage: number
  rowsPerPage: number
  onPageChange: (currentPage: number, direction: 'forward' | 'back') => void
  onSelectPage: (page: number) => void
  rowsPerPageOptions: number[]
  onRowsPerPageChange: (rowsPerPage: number) => void
}

const Pagination: React.FC<IPagination> = ({
  siblingCount = 1, // the number of sibling pages
  firstCount = 2, // number of first pages
  lastCount = 2, // number of last pages
  currentPage, // should be page + 1
  totalPages,
  onPageChange,
  onSelectPage,
  rowsPerPage,
  rowsPerPageOptions,
  onRowsPerPageChange
}) => {
  const paginationRange = useMemo(() => {
    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + firstCount + lastCount + 3

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > firstCount + 1
    const shouldShowRightDots = rightSiblingIndex < totalPages - lastCount

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = firstCount + 2 * siblingCount + 1
      const leftRange = range(1, leftItemCount)
      const rightRange = range(totalPages - lastCount + 1, totalPages)

      return [...leftRange, DOTS, ...rightRange]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = lastCount + 2 * siblingCount + 1
      const leftRange = range(1, firstCount)
      const rightRange = range(totalPages - rightItemCount + 1, totalPages)
      return [...leftRange, DOTS, ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = range(1, firstCount)
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      const rightRange = range(totalPages - lastCount + 1, totalPages)

      return [...leftRange, DOTS, ...middleRange, DOTS, ...rightRange]
    }
  }, [currentPage, firstCount, lastCount, siblingCount, totalPages])

  return (
    <div className="flex gap-4 font-inter items-center justify-between w-full">
      {renderRowsPerPage(
        rowsPerPage,
        rowsPerPageOptions,
        <RowsPerPage
          setPage={onSelectPage}
          size={rowsPerPage}
          dataPaginate={rowsPerPageOptions}
          setSize={onRowsPerPageChange}
          title="Rows per page"
        />
      ) || null}
      <div className="flex gap-2 items-center text-xs text-dashboard-sub">
        <button
          disabled={currentPage === 1}
          type="button"
          className={`disabled:cursor-not-allowed p-1 ${currentPage !== 1 && 'hover:bg-grey-200 hover:rounded-[4px]'}`}
          onClick={() => {
            onPageChange(Number(currentPage) - 1, 'back')
          }}
        >
          <img src="/svg/chevron-left.svg" alt="arrow-left" width={12} height={12} />
        </button>

        {paginationRange?.map((page, index) =>
          page === DOTS ? (
            <div key={`page_${page}_${index}`} className="w-6 h-6 text-center">
              {page}
            </div>
          ) : (
            <button
              key={`page_${page}_${index}`}
              type="button"
              className={`w-6 h-6 text-center rounded-[4px] ${page !== currentPage && 'hover:bg-grey-200'} ${
                page === currentPage && 'bg-[#EFEFEF]'
              }`}
              onClick={() => {
                onSelectPage(Number(page) - 1)
              }}
            >
              {page}
            </button>
          )
        )}
        <button
          disabled={currentPage === totalPages}
          type="button"
          className={`disabled:cursor-not-allowed p-1 ${
            currentPage !== totalPages && 'hover:bg-grey-200 hover:rounded-[4px]'
          }`}
          onClick={() => {
            onPageChange(Number(currentPage) - 1, 'forward')
          }}
        >
          <img src="/svg/chevron-right.svg" alt="arrow-left" width={12} height={12} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
