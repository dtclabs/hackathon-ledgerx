import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

const TransactionLoader = ({ emptyRows = 25 }) => (
  <>
    {[...Array(emptyRows).keys()].map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <tr key={`draft-loading-${index}`} className="h-[61px]" style={{ borderBottom: '1px solid #F1F1EF' }}>
        <td className="py-3 pt-4 px-6">
          <SkeletonLoader variant="rounded" height={20} width={120} />
        </td>
        <td className="py-3 pt-4 px-6">
          <SkeletonLoader variant="rounded" height={12} width={120} />
          <SkeletonLoader variant="rounded" height={12} width={60} />
        </td>
        <td className="py-3 pt-4 px-6">
          <SkeletonLoader variant="rounded" height={12} width={120} />
          <SkeletonLoader variant="rounded" height={12} width={60} />
        </td>
      </tr>
    ))}
  </>
)

export default TransactionLoader
