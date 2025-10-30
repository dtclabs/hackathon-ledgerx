/* eslint-disable consistent-return */
import { useMemo } from 'react'
import { IPaginationProps } from '@/components/Pagination/types'

const DOTS = '...'
const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, index) => index + start)
}
type usePaginationType = Omit<IPaginationProps, 'onPageChange'>
export const usePagination = ({ siblingCount = 1, currentPage, totalPages }: usePaginationType) => {
  const paginationRange = useMemo(() => {
    const totalPageNumber = siblingCount + 3
    if (totalPageNumber >= totalPages - 1) return range(0, totalPages - 1)
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)
    const isShowLeftDots = leftSiblingIndex - 1 > 0
    const isShowRightDots = rightSiblingIndex < totalPages - 1
    const firstPageIndex = 1
    const lastPageIndex = totalPages - 1
    if (!isShowLeftDots && isShowRightDots) {
      const leftItemCount = siblingCount + 2 * siblingCount
      const leftRange = range(0, leftItemCount)

      return [...leftRange, DOTS, totalPages - 1]
    }

    if (isShowLeftDots && !isShowRightDots) {
      const rightItemCount = siblingCount + 2 * siblingCount
      const rightRange = range(totalPages - rightItemCount, totalPages - 1)
      return [firstPageIndex - 1, DOTS, ...rightRange]
    }

    if (isShowLeftDots && isShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex - 1, DOTS, ...middleRange, DOTS, lastPageIndex]
    }
  }, [siblingCount, currentPage, totalPages])

  return paginationRange
}
