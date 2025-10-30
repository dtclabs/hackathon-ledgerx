/* eslint-disable react/no-array-index-key */
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

const TransactionsLoading = () => (
  <div className="mt-4">
    {[...Array(5).keys()].map((item, index) => (
      <div
        key={index}
        className="flex flex-row gap-6 h-[80px] items-center"
        style={{ borderBottom: '1px solid #F1F1EF' }}
      >
        <div className="flex flex-row basis-1/3">
          <div className="basis-1/5">
            <SkeletonLoader variant="circle" size={28} />
          </div>
          <div className="basis-4/5">
            <SkeletonLoader variant="rounded" height={12} width="100%" />
            <SkeletonLoader variant="rounded" height={8} width={100} />
          </div>
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={12} width={150} />
          <SkeletonLoader variant="rounded" height={8} width="100%" />
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={16} width="100%" />
        </div>
      </div>
    ))}
  </div>
)

export default TransactionsLoading
