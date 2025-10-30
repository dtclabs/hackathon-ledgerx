/* eslint-disable react/no-array-index-key */
import Typography from '@/components-v2/atoms/Typography'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'

const ChartOfAccountsLoading = ({ emptyRows }) => {
  const safeGuardEmptyRows = emptyRows < 0 ? 25 : emptyRows
  return (
    <>
      {[...Array(safeGuardEmptyRows ?? 25).keys()].map((item, index) => (
        <BaseTable.Body.Row extendedClass="h-[57px]" key={`coa-loading-${index}`}>
          <BaseTable.Body.Row.Cell>
            <SkeletonLoader variant="rounded" height={14} width={50} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <SkeletonLoader variant="rounded" height={14} width={80} />
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <SkeletonLoader variant="rounded" height={14} width={300} />
          </BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
      ))}
    </>
  )
}

export default ChartOfAccountsLoading
