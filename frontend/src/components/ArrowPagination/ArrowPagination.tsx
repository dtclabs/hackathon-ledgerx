import React, { useState } from 'react'
import { IArrowPagination } from './interface'
import Typography from '@/components-v2/atoms/Typography'

const ArrowPagination: React.FC<IArrowPagination> = ({
  currentPage,
  onPageChange,
  pageSize,
  totalCount,
  loading = false
}) => {
  const [load, setLoad] = useState(false)
  const onNext = () => {
    onPageChange(currentPage + 1)
  }

  const onPrevious = () => {
    onPageChange(currentPage - 1)
  }

  if (currentPage === 0) {
    return null
  }

  return (
    <div className="bg-white w-full flex justify-between items-center px-6 py-3">
      <div className="font-inter font-medium text-gray-700 text-sm">
        <p>
          {totalCount > 0
            ? `Showing ${(currentPage - 1) * pageSize + 1} to
          ${(currentPage - 1) * pageSize + 10 > totalCount ? totalCount : (currentPage - 1) * pageSize + 10} of
          ${totalCount} results`
            : 'No Results Found'}
        </p>
      </div>
      <div className="flex justify-center items-center gap-5">
        <button
          type="button"
          className={`cursor:pointer px-4 bg-white text-gray-700 ${
            currentPage === 1 && ' opacity-40 cursor-not-allowed'
          } font-inter font-medium border border-gray-300 text-sm rounded-md h-10`}
          onClick={() => {
            onPrevious()
            if (loading) {
              setLoad(true)
              setTimeout(() => {
                setLoad(false)
              }, 2000)
            }
          }}
          disabled={currentPage === 1 || load}
        >
          <Typography variant="caption">Previous</Typography>
        </button>
        <button
          type="button"
          className={`cursor:pointer px-4 bg-white text-gray-700 ${
            currentPage * pageSize >= totalCount && ' opacity-40 cursor-not-allowed'
          }  font-inter font-medium border border-gray-300 text-sm rounded-md h-10`}
          onClick={() => {
            onNext()
            if (loading) {
              setLoad(true)
              setTimeout(() => {
                setLoad(false)
              }, 2000)
            }
          }}
          disabled={currentPage * pageSize >= totalCount || load}
        >
          <Typography variant="caption">Next</Typography>
        </button>
      </div>
    </div>
  )
}

export default ArrowPagination
