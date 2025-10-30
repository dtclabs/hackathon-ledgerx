import React, { FC, memo } from 'react'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

interface ITransactionSkeletonRowProps {
  emptyRows: number
  isLoading: boolean // Assuming this prop controls the loading state
}

const ExecuteTransactionSkeletonRow: FC<ITransactionSkeletonRowProps> = memo(({ emptyRows, isLoading }) => {
  const skeletonRows = [...Array(emptyRows ?? 5).keys()]

  // If not loading, you can choose to return null or a different placeholder
  if (!isLoading) {
    return null
  }

  return (
    <>
      {skeletonRows.map((index) => (
        <div
          key={`execute-tx-loading-${index}`}
          className={`${
            index === skeletonRows.length - 1 ? 'h-[76px]' : 'border-b'
          } flex justify-between items-center p-2 px-5`}
        >
          <div>
            <SkeletonLoader variant="rounded" height={14} width={30} />
          </div>
          <div>
            <SkeletonLoader variant="rounded" height={14} width={120} />
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </div>
          <div>
            <SkeletonLoader variant="rounded" height={14} width={150} />
            <SkeletonLoader variant="rounded" height={14} width={180} />
          </div>
          <div>
            <SkeletonLoader variant="rounded" height={14} width={100} />
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </div>
          <div>
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </div>
          <div>
            <div className="mr-24">
              <SkeletonLoader variant="rounded" height={40} width={100} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}, areEqual)

// Helper function to determine if props are equal
function areEqual(prevProps, nextProps) {
  return prevProps.isLoading === nextProps.isLoading // Only re-render if isLoading changes
}

export default ExecuteTransactionSkeletonRow
