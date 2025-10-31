/* eslint-disable react/no-array-index-key */
import { FC } from 'react'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

interface ITransactionSkeletonRowProps {
  emptyRows: number
}

const TransactionSkeletonRow: FC<ITransactionSkeletonRowProps> = ({ emptyRows }) => {
  const safeGuardEmptyRows = emptyRows < 0 ? 5 : emptyRows
  return (
    <>
      {[...Array(safeGuardEmptyRows ?? 5).keys()].map((item, index) => (
        <BaseTable.Body.Row extendedClass="h-[73px]" key={`tx-loading-${index}`}>
          <BaseTable.Body.Row.Cell>
            <SkeletonLoader variant="rounded" height={14} width={30} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <SkeletonLoader variant="rounded" height={14} width={150} />
            <SkeletonLoader variant="rounded" height={14} width={180} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell extendedClass="w-[400px]">
            <SkeletonLoader variant="rounded" height={14} width={150} />
            <SkeletonLoader variant="rounded" height={14} width={180} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell extendedClass="w-[200px]">
            <SkeletonLoader variant="rounded" height={14} width={80} />
            <SkeletonLoader variant="rounded" height={14} width={100} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <SkeletonLoader variant="rounded" height={14} width={250} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <div className="flex flex-row gap-2">
              <SkeletonLoader variant="rounded" height={40} width={100} />
              <SkeletonLoader variant="rounded" height={40} width={100} />
            </div>
          </BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
      ))}
    </>
  )
}

export default TransactionSkeletonRow
