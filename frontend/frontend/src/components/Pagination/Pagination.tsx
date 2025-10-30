/* eslint-disable react/no-array-index-key */
import React from 'react'
import { IPaginationProps } from './types'
import { usePagination } from '../../hooks/usePagination'
import { DOTS } from './dot'

const Pagination: React.FC<IPaginationProps> = ({
  totalItems,
  limit,
  siblingCount = 1,
  currentPage,
  onPageChange,
  totalPages
}) => {
  const paginationRange = usePagination({
    currentPage,
    limit,
    totalItems,
    siblingCount,
    totalPages
  })
  if (totalPages === 1) return null
  let lastPage
  if (paginationRange) {
    lastPage = paginationRange[paginationRange.length - 1]
  }
  const onPreviousPageChange = () => {
    if (currentPage > 0) onPageChange(currentPage - 1)
  }
  const onNextPageChange = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }
  return (
    <nav className="justify-end font-inter" aria-label="Page navigation example">
      <ul className="flex justify-end items-center font-inter text-gray-500 ">
        <li>
          <button
            type="button"
            onClick={onPreviousPageChange}
            className={[
              `block py-1.5 px-2 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 ${
                currentPage === 0 ? ' opacity-40 cursor-not-allowed' : ''
              }`
            ].join('')}
            disabled={currentPage === 0}
          >
            <span className="sr-only">Previous</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
        {paginationRange &&
          paginationRange.map((pageNumber, index) => {
            if (pageNumber === '...') return <DOTS key={index} />
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onPageChange(pageNumber as number)}
                  className={[
                    `py-1.5 px-3 ml-1 leading-tight rounded bg-white border hover:bg-gray-100 hover:text-gray-700 ${
                      currentPage === pageNumber
                        ? 'border-gray-500 text-gray-700 font-semibold'
                        : 'border-gray-300 text-gray-500'
                    }`
                  ].join('')}
                >
                  {Number(pageNumber) + 1}
                </button>
              </li>
            )
          })}
        <li>
          <button
            onClick={onNextPageChange}
            type="button"
            className={[
              `block ml-1 py-1.5 px-2 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 ${
                currentPage === lastPage ? ' opacity-40 cursor-not-allowed' : ''
              }`
            ].join('')}
            disabled={currentPage === lastPage}
          >
            <span className="sr-only">Next</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
