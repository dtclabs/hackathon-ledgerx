import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

const DraftTransactionListLoader = ({ emptyRows = 25 }) => (
  <>
    {[...Array(emptyRows).keys()].map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <tr key={`draft-loading-${index}`} className="h-[61px]" style={{ borderBottom: '1px solid #F1F1EF' }}>
        <td id="checkbox" className="py-3">
          <div className="flex justify-center flex-col items-center gap-2 px-4 cursor-pointer">
            <SkeletonLoader variant="rounded" height={12} width={20} />
          </div>
        </td>
        <td id="recipient" className="py-3 pl-2">
          <SkeletonLoader variant="rounded" height={12} width={120} />
          <SkeletonLoader variant="rounded" height={12} width={60} />
        </td>
        <td id="amount" className="pl-2 py-3">
          <SkeletonLoader variant="rounded" height={12} width={100} />
          <SkeletonLoader variant="rounded" height={12} width={60} />
        </td>
        <td id="account" className="pl-2 py-3">
          <div className="flex flex-col gap-1">
            <SkeletonLoader variant="rounded" height={12} width={120} />
          </div>
        </td>
        <td id="created_on" className="pl-2 py-3">
          <div className="flex flex-col gap-1">
            <SkeletonLoader variant="rounded" height={12} width={80} />
            <SkeletonLoader variant="rounded" height={12} width={60} />
          </div>
        </td>
        <td id="reviewer" className="pl-2 py-3">
          <div className="flex flex-col gap-1">
            <SkeletonLoader variant="rounded" height={12} width={100} />
          </div>
        </td>
        <td id="action" className="pl-2 py-3">
          <SkeletonLoader variant="rounded" height={12} width={120} />
        </td>
      </tr>
    ))}
  </>
)

export default DraftTransactionListLoader
